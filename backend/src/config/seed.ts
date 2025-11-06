import {sha256} from "@/utils/hash";

export function generateSeed():string {
    /**
     * According to the requirements, seed should be generated with the formula:
     * The moment project started (timestamp), YYYYMMDDHHmm
     * Github Remote Url
     * Timestamp of the first commit of the project
     * Join strings: <remote_url|<first_commit_epoch|<start_time>>>
     * SHA256 the joint string, and take the first 12 characters
     **/

    const PROJECT_START_TIME = "202511041800"
    const GITHUB_REMOTE_URL = "https://github.com/firatkocoglu/dropspot"
    const FIRST_COMMIT_EPOCH = "1762268549"
    const seedString = `${GITHUB_REMOTE_URL}|${FIRST_COMMIT_EPOCH}|${PROJECT_START_TIME}`
    const hashedSeed = sha256(seedString)
    return hashedSeed.substring(0, 12)
}

export const PROJECT_SEED = generateSeed()