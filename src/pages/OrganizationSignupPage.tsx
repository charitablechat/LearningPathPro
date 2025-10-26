import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createOrganization, slugify, validatePromoCode, redeemPromoCode } from '../lib/organization';
import { supabase } from '../lib/supabase';
import { navigateTo, getPath } from '../lib/router';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useToast } from '../hooks/useToast';
import { Building2, ArrowRight, Tag, Check } from 'lucide-react';

export function OrganizationSignupPage() {
  const { user, refetchProfile } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [step, setStep] = useState(1);
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#1E40AF');
  const [loading, setLoading] = useState(false);
  const [validatedPromo, setValidatedPromo] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState('Creating...');
  const [showFallbackButton, setShowFallbackButton] = useState(false);

  const handleNameChange = (name: string) => {
    setOrganizationName(name);
    setOrganizationSlug(slugify(name));
  };

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      showError('Please enter a promo code');
      return;
    }

    setLoading(true);
    const promo = await validatePromoCode(promoCode);
    setLoading(false);

    if (!promo) {
      showError('Invalid or expired promo code');
      return;
    }

    setValidatedPromo(promo);
    showSuccess('Promo code applied successfully!');
  };

  const handleCreateOrganization = async () => {
    if (!organizationName.trim() || !organizationSlug.trim()) {
      showError('Please fill in all required fields');
      return;
    }

    if (!user) {
      showError('You must be logged in to create an organization');
      return;
    }

    setLoading(true);
    setLoadingMessage('Creating organization...');
    console.log('[ORG CREATION] Starting organization creation process...');
    console.log('[ORG CREATION] User ID:', user.id);
    console.log('[ORG CREATION] Org Name:', organizationName);
    console.log('[ORG CREATION] Org Slug:', organizationSlug);

    try {
      console.log('[ORG CREATION] Step 1: Checking if slug exists...');
      const { data: existingOrg, error: checkError } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', organizationSlug)
        .maybeSingle();

      if (checkError) {
        console.error('[ORG CREATION] Error checking slug:', checkError);
        showError(`Database error: ${checkError.message}`);
        setLoading(false);
        return;
      }

      if (existingOrg) {
        console.log('[ORG CREATION] Slug already exists');
        showError('This organization name is already taken. Please choose another.');
        setLoading(false);
        return;
      }

      console.log('[ORG CREATION] Step 2: Creating organization...');
      const org = await createOrganization({
        name: organizationName,
        slug: organizationSlug,
        owner_id: user.id,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });

      if (!org) {
        console.error('[ORG CREATION] Organization creation returned null');
        showError('Failed to create organization. Please check console for details.');
        setLoading(false);
        return;
      }

      console.log('[ORG CREATION] Organization created successfully:', org.id);

      setLoadingMessage('Setting up your profile...');
      console.log('[ORG CREATION] Step 3: Updating profile with organization_id and role...');
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({
          organization_id: org.id,
          role: 'admin',
        })
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) {
        console.error('[ORG CREATION] Error updating profile:', profileError);
        showError(`Failed to link profile: ${profileError.message}`);
        setLoading(false);
        return;
      }

      console.log('[ORG CREATION] Profile updated successfully:', updatedProfile);

      if (validatedPromo && validatedPromo.type === 'lifetime_deal') {
        setLoadingMessage('Activating promo code...');
        console.log('[ORG CREATION] Step 4: Redeeming promo code...');
        const redeemed = await redeemPromoCode(validatedPromo.id, org.id, user.id);

        if (redeemed) {
          console.log('[ORG CREATION] Promo code redeemed, updating organization status...');
          const { error: updateError } = await supabase
            .from('organizations')
            .update({
              subscription_status: 'lifetime',
              trial_ends_at: null,
            })
            .eq('id', org.id);

          if (updateError) {
            console.error('[ORG CREATION] Error updating org status:', updateError);
          } else {
            console.log('[ORG CREATION] Lifetime deal activated!');
          }
        }
      }

      setLoadingMessage('Finalizing setup...');
      console.log('[ORG CREATION] Step 5: Refetching profile to sync state...');
      const refreshedProfile = await refetchProfile();

      console.log('[ORG CREATION] Step 6: Profile refreshed, navigating to dashboard...');

      if (refreshedProfile?.organization_id === org.id) {
        console.log('[ORG CREATION] Profile confirmed with organization_id, navigating immediately...');
        showSuccess('Organization created successfully!');

        setTimeout(() => {
          console.log('[ORG CREATION] Executing navigation to dashboard...');
          navigateTo('/dashboard');
          setLoading(false);
        }, 300);

        setTimeout(() => {
          if (getPath() === '/organization/signup') {
            console.warn('[ORG CREATION] Navigation may have failed, showing fallback button');
            setShowFallbackButton(true);
            setLoading(false);
          }
        }, 3000);
      } else {
        console.warn('[ORG CREATION] Profile refresh did not return expected organization_id, attempting navigation anyway...');
        showSuccess('Organization created successfully!');

        setTimeout(() => {
          console.log('[ORG CREATION] Forcing navigation to dashboard...');
          navigateTo('/dashboard');
          setLoading(false);
        }, 300);

        setTimeout(() => {
          if (getPath() === '/organization/signup') {
            console.warn('[ORG CREATION] Navigation may have failed, showing fallback button');
            setShowFallbackButton(true);
            setLoading(false);
          }
        }, 3000);
      }
    } catch (error: any) {
      console.error('[ORG CREATION] Unexpected error:', error);
      showError(`Error: ${error?.message || 'An unexpected error occurred'}`);
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!organizationName.trim()) {
        showError('Please enter an organization name');
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
            {step > 1 && !showFallbackButton && (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={nextStep} className="ml-auto">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : showFallbackButton ? (
              <Button onClick={() => navigateTo('/dashboard')} className="w-full">
                Continue to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleCreateOrganization} disabled={loading} className="ml-auto">
                {loading ? loadingMessage : 'Create Organization'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
