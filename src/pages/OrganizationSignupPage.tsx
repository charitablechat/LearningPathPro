import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createOrganization, slugify, validatePromoCode, redeemPromoCode } from '../lib/organization';
import { supabase } from '../lib/supabase';
import { navigateTo } from '../lib/router';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useToast } from '../hooks/useToast';
import { Building2, ArrowRight, Tag, Check } from 'lucide-react';

export function OrganizationSignupPage() {
  const { user, refetchProfile } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#1E40AF');
  const [loading, setLoading] = useState(false);
  const [validatedPromo, setValidatedPromo] = useState<any>(null);

  const handleNameChange = (name: string) => {
    setOrganizationName(name);
    setOrganizationSlug(slugify(name));
  };

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      showToast('Please enter a promo code', 'error');
      return;
    }

    setLoading(true);
    const promo = await validatePromoCode(promoCode);
    setLoading(false);

    if (!promo) {
      showToast('Invalid or expired promo code', 'error');
      return;
    }

    setValidatedPromo(promo);
    showToast('Promo code applied successfully!', 'success');
  };

  const handleCreateOrganization = async () => {
    if (!organizationName.trim() || !organizationSlug.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!user) {
      showToast('You must be logged in to create an organization', 'error');
      return;
    }

    setLoading(true);

    try {
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', organizationSlug)
        .maybeSingle();

      if (existingOrg) {
        showToast('This organization name is already taken. Please choose another.', 'error');
        setLoading(false);
        return;
      }

      const org = await createOrganization({
        name: organizationName,
        slug: organizationSlug,
        owner_id: user.id,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });

      if (!org) {
        showToast('Failed to create organization. Please try again.', 'error');
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          organization_id: org.id,
          role: 'admin',
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        showToast('Failed to link profile to organization. Please try again.', 'error');
        setLoading(false);
        return;
      }

      if (validatedPromo && validatedPromo.type === 'lifetime_deal') {
        const redeemed = await redeemPromoCode(validatedPromo.id, org.id, user.id);

        if (redeemed) {
          await supabase
            .from('organizations')
            .update({
              subscription_status: 'lifetime',
              trial_ends_at: null,
            })
            .eq('id', org.id);

          showToast('Lifetime deal activated!', 'success');
        }
      }

      await refetchProfile();

      let retryCount = 0;
      const maxRetries = 10;
      while (retryCount < maxRetries) {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('organization_id, role')
          .eq('id', user.id)
          .maybeSingle();

        if (updatedProfile?.organization_id === org.id && updatedProfile?.role === 'admin') {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 300));
        retryCount++;
      }

      showToast('Organization created successfully!', 'success');

      await new Promise(resolve => setTimeout(resolve, 100));

      navigateTo('/dashboard');
    } catch (error) {
      console.error('Error creating organization:', error);
      showToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!organizationName.trim()) {
        showToast('Please enter an organization name', 'error');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 mb-4">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Organization</h1>
          <p className="text-slate-400">Set up your learning platform in just a few steps</p>
        </div>

        <div className="flex items-center justify-center mb-8 space-x-2">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= num ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {step > num ? <Check className="w-5 h-5" /> : num}
              </div>
              {num < 3 && (
                <div
                  className={`w-12 h-1 ${
                    step > num ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Organization Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Organization Name *
                    </label>
                    <Input
                      value={organizationName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Acme Learning Academy"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      URL Slug *
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={organizationSlug}
                        onChange={(e) => setOrganizationSlug(slugify(e.target.value))}
                        placeholder="acme-learning"
                        className="flex-1"
                      />
                      <span className="text-slate-400 text-sm">.clearcoursestudio.com</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      This will be your organization's unique subdomain
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Brand Colors</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Customize your organization's color scheme
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-16 h-16 rounded-lg cursor-pointer border-2 border-slate-600"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-16 h-16 rounded-lg cursor-pointer border-2 border-slate-600"
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="mt-6 p-6 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  <p className="text-white font-semibold text-center">Preview</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Promo Code (Optional)</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Have a promo code? Enter it below to unlock special offers
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="PROMO2025"
                        disabled={!!validatedPromo}
                        className="w-full"
                      />
                    </div>
                    <Button
                      onClick={handleValidatePromo}
                      disabled={loading || !!validatedPromo}
                      variant="outline"
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Apply
                    </Button>
                  </div>

                  {validatedPromo && (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="text-green-400 font-semibold">Promo Code Applied!</p>
                          <p className="text-slate-300 text-sm mt-1">
                            {validatedPromo.type === 'lifetime_deal'
                              ? 'Lifetime Deal - One-time payment for lifetime access'
                              : `${validatedPromo.discount_percent}% discount applied`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-800/50 rounded-lg p-6 mt-6">
                    <h3 className="text-white font-semibold mb-3">What's Included:</h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-blue-400 mr-2" />
                        14-day free trial - No credit card required
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-blue-400 mr-2" />
                        Full access to all features during trial
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-blue-400 mr-2" />
                        Cancel anytime before trial ends
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={nextStep} className="ml-auto">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleCreateOrganization} disabled={loading} className="ml-auto">
                {loading ? 'Creating...' : 'Create Organization'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
