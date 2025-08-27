import { useRouter } from "next/navigation";
import styles from "@/components/ui/unauthorized.module.css";
import { LockIcon, HomeIcon } from "@/components/ui/icons";

export default async function Unauthorized() {
    const router = useRouter();
    const handleGoHome = () => {
        router.push(HOME_PAGE_URL);
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.iconContainer}>
                    <div className={styles.lockIcon}>
                        <LockIcon />
                    </div>
                </div>
                
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>Unauthorized Access</h1>
                    <p className={styles.subtitle}>
                        You don't have permission to access this page.
                    </p>
                    <p className={styles.description}>
                        Please sign in with a valid account or contact administrator if you believe this is an error.
                    </p>
                </div>
                
                <div className={styles.buttonContainer}>
                    <button
                        onClick={handleGoHome}
                        className={styles.homeButton}
                    >
                        <HomeIcon />
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
