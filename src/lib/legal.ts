import { supabase } from './supabase';

export const CURRENT_TERMS_VERSION = '1.0';

export interface TermsAcceptance {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingConsent: boolean;
}

export async function acceptLegalTerms(acceptance: TermsAcceptance): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('accept_legal_terms', {
      p_terms_accepted: acceptance.termsAccepted,
      p_privacy_accepted: acceptance.privacyAccepted,
      p_marketing_consent: acceptance.marketingConsent,
      p_version: CURRENT_TERMS_VERSION,
    });

    if (error) {
      console.error('[LEGAL] Error accepting terms:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[LEGAL] Exception accepting terms:', err);
    return { success: false, error: err.message || 'Failed to record acceptance' };
  }
}

export async function hasAcceptedTerms(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('terms_accepted_at, privacy_accepted_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return !!(data.terms_accepted_at && data.privacy_accepted_at);
  } catch (err) {
    console.error('[LEGAL] Error checking terms acceptance:', err);
    return false;
  }
}

export async function getLegalAcceptanceLog(userId: string) {
  try {
    const { data, error } = await supabase
      .from('legal_acceptance_log')
      .select('*')
      .eq('user_id', userId)
      .order('accepted_at', { ascending: false });

    if (error) {
      console.error('[LEGAL] Error fetching acceptance log:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[LEGAL] Exception fetching acceptance log:', err);
    return [];
  }
}

export async function updateMarketingConsent(consent: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ marketing_emails_consent: consent })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      return { success: false, error: error.message };
    }

    if (consent) {
      await supabase
        .from('legal_acceptance_log')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          document_type: 'marketing',
          document_version: CURRENT_TERMS_VERSION,
        });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function exportUserData(userId: string) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: courses } = await supabase
      .from('enrollments')
      .select('*, courses(*)')
      .eq('user_id', userId);

    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId);

    const { data: legalLog } = await supabase
      .from('legal_acceptance_log')
      .select('*')
      .eq('user_id', userId);

    return {
      profile,
      courses,
      progress,
      legalAcceptance: legalLog,
      exportedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[LEGAL] Error exporting user data:', err);
    throw err;
  }
}
