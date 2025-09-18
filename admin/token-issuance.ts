import { jwtSign } from "@/lib/jwt";
import { redis } from "@/lib/redis";

// necessary env: [AUTHTOKEN_PREFIX] [JWT_SECRET_KEY] [JWT_ISSUER] [JWT_AUDIENCE] [UPSTASH_REDIS_REST_URL] [UPSTASH_REDIS_REST_TOKEN]
async function issue_token(expiresIn: number): Promise<string | undefined> {
    if (process.env.AUTHTOKEN_PREFIX === undefined) {
        console.error("[AUTHTOKEN_PREFIX] env not set.");
        return undefined;
    }
    const { token: jwtToken, error } = await jwtSign();
    if (jwtToken === undefined) {
        console.error("jwtSign failed.");
        return undefined;
    }
    const token = crypto.randomUUID();
    await redis.set<string>(
        [process.env.AUTHTOKEN_PREFIX, token].join(":"),
        jwtToken,
        { ex: expiresIn }
    );
    return token;
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log('用法: npx tsx --env-file=<env file> admin/token-issuance.ts <expiresInSeconds>');
        console.log('');
        console.log('参数说明:');
        console.log('  expiresInSeconds     - 有效时间（秒）');
        console.log('');
        console.log('使用示例:');
        console.log('  npx tsx --env-file=.env.local admin/token-issuance.ts 3600');
        process.exit(1);
    }
    const [expiresIn] = args;
    const token = await issue_token(Number(expiresIn));
    console.log(`Issued Token: ${token}`);
}

main().catch(err => {
    console.error('failed:', err);
    process.exit(1);
});