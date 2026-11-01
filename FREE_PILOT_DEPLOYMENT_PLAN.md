# SHIKSHAN (ಶಿಕ್ಷಣ) — ZERO-COST FREE PILOT DEPLOYMENT ARCHITECTURE

**Document Version:** 1.0.0  
**Target Audience:** Students (Classes 1–10), Mentors, Tutors, and Pilot Coordinators in Karnataka  
**Cost Model:** **₹0 / Month (100% Free Forever — Zero Cloud Bills, Zero Credit Card Required)**  

---

## 1. Executive Summary & Problem Resolution

### The Network Bottleneck Solved
Previously, when running Shikshan on an Android phone over mobile data (4G/5G) or outside the home Wi-Fi network, the app reported:
> *"Unable to connect to Shikshan backend API. Please ensure your phone is connected to the same Wi-Fi network as your laptop."*

This occurred because `192.168.1.253` is an internal private IPv4 subnet address routable only inside your local home router. Outside devices (such as friends, students, or tutors testing on their own phones) cannot route to private LAN IPs without a public relay.

### The Solution: Dual Zero-Cost Pathways
Shikshan now features:
1. **Dynamic In-App Server Settings Modal:** Accessible via the gear icon (`⚙️`) on the authentication screen. Testers can switch endpoints or test latency in 1 click.
2. **Two 100% Free Pilot Distribution Architectures:**
   - **Path A (Instant 2-Minute Setup):** Cloudflare Tunnel directly tunneling your laptop's local MySQL backend to a public HTTPS URL.
   - **Path B (24/7 Autonomous Hosting):** Render.com (Node.js API) + TiDB Cloud Serverless (5GB Free Forever MySQL database).

---

## 2. Path A: Cloudflare Quick Tunnel (Recommended for Instant Testing)

Keep your existing laptop backend and local MySQL `shikshan_db` database intact. Cloudflare provides a secure, encrypted public HTTPS tunnel without opening router ports or altering firewall NAT rules.

### Step 1: Install Cloudflare Tunnel (Windows)
Run PowerShell as Administrator or standard terminal:
```powershell
# Option 1: Via winget (Windows Package Manager)
winget install --id Cloudflare.cloudflared -e

# Option 2: Direct download
# Download cloudflared-windows-amd64.exe from:
# https://github.com/cloudflare/cloudflared/releases/latest
```

### Step 2: Launch the Tunnel
Ensure your Shikshan backend is running (`node server/src/index.js` on port 5000), then execute:
```powershell
cloudflared tunnel --url http://localhost:5000
```

Cloudflare will instantly output a public HTTPS tunnel URL:
```text
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://random-words-subdomain.trycloudflare.com                                          |
+--------------------------------------------------------------------------------------------+
```

### Step 3: Connect the Android App
1. Open the Shikshan app on any Android device connected to 4G/5G mobile internet.
2. Tap the **Settings icon (`⚙️`)** on the login header.
3. Paste: `https://random-words-subdomain.trycloudflare.com/api`
4. Tap **Test Server** → Observe instant green checkmark: *"Connected successfully! Server: ok, DB: connected"*.
5. Tap **Save & Apply**. All student registrations, tutor applications, and marketplace queries will now route seamlessly over the internet!

---

## 3. Path B: 24/7 Free Cloud Hosting (TiDB Cloud + Render.com)

If you do not want to leave your laptop running during the pilot, this architecture runs 24/7 with zero ongoing cost.

### Component 1: Free MySQL Database — TiDB Cloud Serverless
- **Provider:** TiDB Cloud (PingCAP)
- **Cost:** Free Tier (5 GB Storage, 50M Request Units / month — ample for thousands of pilot students)
- **Compatibility:** 100% MySQL 8.0 wire-protocol compatible. **Zero code changes required in `server/src/db.js`**.
- **Setup:**
  1. Sign up at [https://tidbcloud.com](https://tidbcloud.com) (Sign in with Google, no credit card required).
  2. Create a free **Serverless Cluster** named `shikshan-db`.
  3. Copy the MySQL connection parameters: Host, Port (4000), User, and Password.
  4. Import your local schema:
     ```powershell
     mysql -h <tidb-host> -P 4000 -u <tidb-user> -p < server/scripts/schema.sql
     ```

### Component 2: Free Backend Hosting — Render.com
- **Provider:** Render Web Services
- **Cost:** Free Tier (512 MB RAM, free TLS certificates, automatic GitHub deployment)
- **Setup:**
  1. Push the `server/` directory to a GitHub repository.
  2. In Render, select **New Web Service** → Connect your repository.
  3. Configure Build & Start Commands:
     - **Root Directory:** `server`
     - **Build Command:** `npm install`
     - **Start Command:** `node src/index.js`
  4. In **Environment Variables**, add:
     - `DB_HOST`: `<tidb-host>`
     - `DB_PORT`: `4000`
     - `DB_USER`: `<tidb-user>`
     - `DB_PASSWORD`: `<tidb-password>`
     - `DB_NAME`: `shikshan_db`
     - `JWT_SECRET`: `your_secure_jwt_secret_key`
     - `ADMIN_EMAIL`: `abhishekdevanagaon2712005@gmail.com`
     - `ADMIN_PASSWORD`: `AdminPassword@123`
     - `ADMIN_PHONE`: `9019394446`
  5. Click **Deploy**. Render will provide a permanent URL: `https://shikshan-api.onrender.com/api`.

---

## 4. Distributing the Android APK to Students & Tutors

### Step 1: Upload APK to Cloud Storage
1. Take the compiled `shikshan-debug.apk` file from the project root.
2. Upload to **Google Drive** or **Dropbox**.
3. Set sharing permission to: *"Anyone with the link can view/download"*.
4. Shorten the link using TinyURL or Bitly (e.g., `https://tinyurl.com/shikshan-pilot-apk`).

### Step 2: User Installation Instructions (Share via WhatsApp)

Copy and share this message with student families and tutors:

```text
Namaskara! 🙏
Welcome to the Shikshan (ಶಿಕ್ಷಣ) Pilot Program for Karnataka Students and Tutors.

📱 Download the Shikshan Android App:
[Insert your Google Drive / TinyURL link here]

⚙️ How to Install on your Android Phone:
1. Tap the download link above and download 'shikshan-debug.apk'.
2. Tap the downloaded file in your notifications or Downloads folder.
3. If Android shows "File might be harmful" or "Install unknown apps", tap "Settings" -> enable "Allow from this source", then tap "Install".
4. Open the Shikshan app!

✨ First-Time Testers:
- Students (Classes 1–10): Tap "Register as Student" to select your class and subjects.
- Tutors & Teachers: Tap "Apply as Tutor" to submit your teaching profile.
- Returning users: Use the Sign In form.
```

---

## 5. Pilot Review & Verification Playbook

### Admin Review Desk
- **URL / Path:** Log in via the app with the administrator credentials:
  - **Email:** `abhishekdevanagaon2712005@gmail.com`
  - **Password:** Configured in your backend `.env`
- **Actions:**
  - View all incoming tutor applications in the **Pending Review** queue.
  - Inspect tutor qualifications, degree, subjects, teaching language (Kannada/English), and proposed rates.
  - Click **Approve Tutor** or **Decline**.
  - Approved tutors immediately appear on the public **Tutor Discovery Marketplace** for students to discover and contact.
