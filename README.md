# fb reminder express.js app

### install

`npm -i`

### setup config

minimal `config.json` content:

```  
{  
    "x_key": "<some_secret_header>",
    "fb_token":"EAAgcpoks048BAB.................",
    "project_id": "rem.....",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMI..................",
    "client_email": "email............",
}
```

### run

Place private key file `privkey.pem` and certificate file `cert.pem` in `./ssl` directory if you need *https* server.
You can obtain these files with letsencrypt certbot.

`npm start`

App will start on `3000` port by default

All requests must be signed with `X-Key` header (value of `x_key` config field)