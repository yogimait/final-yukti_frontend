export const JUDGE0_LANG_IDS = {
    CPP: 54,    // C++ (GCC 9.2.0)
    JAVA: 62,   // Java (OpenJDK 13.0.1)
    PYTHON: 71, // Python (3.8.1)
    JS: 63      // JavaScript (Node.js 12.14.0)
};

// Frontend se aane wale language names ko ID mein convert karne ke liye helper
export const getLanguageId = (lang: string): number => {
    switch (lang.toLowerCase()) {
        case 'cpp':
        case 'c++': return JUDGE0_LANG_IDS.CPP;
        case 'java': return JUDGE0_LANG_IDS.JAVA;
        case 'python': return JUDGE0_LANG_IDS.PYTHON;
        case 'javascript':
        case 'js': return JUDGE0_LANG_IDS.JS;
        default: throw new Error("Unsupported Language");
    }
};