CREATE TABLE users(
    user_id SERIAL,
    user_name TEXT,
    user_password TEXT,
    date_created DATE,
    shadowban BOOL,
    PRIMARY KEY (user_id)
);

CREATE TABLE posts_private(
    post_id SERIAL,
    post_contents TEXT,
    date_created DATE,
    user_id INT,
    PRIMARY KEY (post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE posts_public(
    post_id INT,
    post_contents TEXT,
    date_created DATE,
    PRIMARY KEY (post_id)
);

CREATE TABLE post_hashtags(
    posthashtag_id SERIAL,
    hashtag TEXT,
    post_id INT,
    PRIMARY KEY (posthashtag_id),
    FOREIGN KEY (post_id) REFERENCES posts_public(post_id)
);