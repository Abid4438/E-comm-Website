with open('server/src/routes/customers.ts', 'r') as f:
    content = f.read()
if 'function generateToken' not in content:
    helpers = "\nfunction generateToken(): string {\n  return crypto.randomBytes(32).toString('hex');\n}\nfunction hashToken(token: string): string {\n  return crypto.createHash('sha256').update(token).digest('hex');\n}\n"
    content = content.replace("const APP_URL = process.env.APP_URL || 'http://localhost:5173';", "const APP_URL = process.env.APP_URL || 'http://localhost:5173';" + helpers)
    with open('server/src/routes/customers.ts', 'w') as f:
        f.write(content)
    print('Added helpers')
else:
    print('Already present')
