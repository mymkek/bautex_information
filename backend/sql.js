export const createUsers = `
    DROP TABLE IF EXISTS users; CREATE TABLE IF NOT EXISTS users (
                                         id INT AUTO_INCREMENT PRIMARY KEY,
                                         username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        refresh_token VARCHAR(512),
        refresh_token_expiry DATETIME,
        last_login DATETIME
        );`
