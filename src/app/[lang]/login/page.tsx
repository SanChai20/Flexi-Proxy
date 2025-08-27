import Link from "next/link";
import styles from './page.module.css';
import { auth, signIn } from "@/auth";
import { providerMap } from "@/auth.config";
import { AuthProviderIcon } from '@/components/ui/icons';
import { Metadata } from "next";

import Unauthorized from "@/components/ui/unauthorized";
import { OnceButton } from "@/components/ui/oncebutton";
import { Locale } from "../../../../i18n-config";
import { getDictionary } from "@/utils/get-dictionary";

export const metadata: Metadata = {
    title: 'Login - API Base Router',
    description: 'Sign in to your account',
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
        }
    }
};

const verifyToken = async (token: string | null) : Promise<boolean> => {
    if (!token) {
        alert('CAPTCHA verification failed');
        return false;
    }
    const validateResponse = await fetch([process.env.BASE_URL || 'https://router.fit', 'api/verify'].join('/'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
    });
    if (!validateResponse.ok) {
        alert('CAPTCHA verification failed');
        return false;
    }
    const data = await validateResponse.json();
    if (data.success === false) {
        alert(`Token validation failed - ${data.message}`);
        return false;
    } else {
        return true;
    }
}

export default async function LoginPage(props: {
    params: Promise<{ lang: Locale }>;
    searchParams: Promise<{ from: string | undefined }>;
}) {
    const { lang } = await props.params;
    const { from } = await props.searchParams;
    const dict = await getDictionary(lang);

    if (!from || typeof from !== 'string') {
        return <Unauthorized dict={dict} />;
    }
    const isVerified = await verifyToken(from);
    if (!isVerified) {
        return <Unauthorized dict={dict} />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
            {/* Logo and Title */}
            <div className={styles.header}>
                <div className={styles.title}>{dict.login.title}</div>
                <p className={styles.subtitle}>{dict.login.subtitle}</p>
            </div>

            {/* Login Card */}
            <div className={styles.card}>
                {/* Email Login Form */}
                <form
                    className={styles.emailForm}
                    action={async (formData) => {
                        "use server";
                        await signIn("resend", formData)
                    }}
                >
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            {dict.login.email}
                        </label>
                        <input 
                            type="email" 
                            name="email" 
                            id="email"
                            placeholder="Enter your email"
                            className={styles.input}
                            required
                        />
                    </div>
                    <OnceButton 
                        type="submit"
                        className={styles.primaryButton}  
                    >
                        {dict.login.emailLogin}
                    </OnceButton>
                </form>

                {/* Divider */}
                <div className={styles.divider}>
                    <div className={styles.dividerText}>
                        <span className={styles.dividerLabel}>or</span>
                    </div>
                </div>

                {/* Social Login Buttons */}
                <div className={styles.socialButtons}>
                    {Object.values(providerMap).map((provider, index) => (
                        <form
                            key={provider.id}
                            action={async () => {
                                "use server";
                                try {
                                    await signIn(provider.id)
                                } catch (error) {
                                    throw error
                                }
                            }}
                        >
                            <OnceButton 
                                type="submit"
                                className={styles.socialButton}
                            >
                                <div className={styles.socialButtonContent}>
                                    {/* Provider Icon */}
                                    <AuthProviderIcon providerId={provider.id} className={styles.providerIcon} />
                                    <span className={styles.socialButtonText}>{dict.login.use} {provider.name}</span>
                                </div>
                            </OnceButton>
                        </form>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <p className={styles.footerText}>
                    {dict.login.agree}{' '}
                    <Link href="/terms" className={styles.footerLink}>{dict.login.terms}</Link>
                    {' '}{dict.login.and}{' '}
                    <Link href="/policy" className={styles.footerLink}>{dict.login.policy}</Link>
                </p>
            </div>
            </div>
        </div>
    )
}