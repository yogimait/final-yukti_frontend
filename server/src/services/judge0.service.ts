import axios from 'axios';
import dotenv from 'dotenv';
// Config
dotenv.config();
const JUDGE0_URL = process.env.JUDGE0_API_URL || "https://ce.judge0.com";

export const executeCode = async (
    languageId: number, 
    sourceCode: string, 
    stdin: string = ""
) => {
    try {
        // Judge0 API ko call karte hain
        const response = await axios.post(
            `${JUDGE0_URL}/submissions/?base64_encoded=false&wait=true`, 
            {
                source_code: sourceCode,
                language_id: languageId,
                stdin: stdin
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.log(JUDGE0_URL)
        console.error("Judge0 Error:", error);
        throw new Error("Code execution failed internally");
    }
};