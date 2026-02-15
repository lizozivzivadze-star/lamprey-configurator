# Lamprey MMAUV Mission Configurator - Installation Guide

## Quick Start (30-Minute Setup)

### Step 1: Fix XAMPP Apache (If Not Running)

**Problem: Port 80 Conflict**
1. Open XAMPP Control Panel
2. Click "Config" button next to Apache → Select "httpd.conf"
3. Find and change:
   - `Listen 80` → `Listen 8080`
   - `ServerName localhost:80` → `ServerName localhost:8080`
4. Save and close
5. Click "Start" for Apache
6. Click "Start" for MySQL

**Access the app at:** `http://localhost:8080/lamprey-configurator/`

---

### Step 2: Copy Files to XAMPP

1. Copy the entire `lamprey-configurator` folder to:
   - **Windows:** `C:\xampp\htdocs\`
   - **Mac:** `/Applications/XAMPP/htdocs/`

Your folder structure should be:
```
htdocs/
└── lamprey-configurator/
    ├── index.html
    ├── database_setup.sql
    ├── config/
    │   └── database.php
    ├── api/
    │   ├── get_missions.php
    │   ├── get_compatible_payloads.php
    │   └── generate_config.php
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

---

### Step 3: Create Database

1. Open phpMyAdmin: `http://localhost:8080/phpmyadmin/`
2. Click "New" in the left sidebar
3. Database name: `lamprey_config`
4. Collation: `utf8mb4_general_ci`
5. Click "Create"

---

### Step 4: Import Database Schema

1. Click on `lamprey_config` database in left sidebar
2. Click "Import" tab at the top
3. Click "Choose File" and select `database_setup.sql`
4. Scroll down and click "Go"
5. You should see "Import has been successfully finished"

**Verify:** Click on the database name - you should see 4 tables:
- compatibility_rules
- interfaces
- missions
- payloads

---

### Step 5: Test the Application

1. Open browser: `http://localhost:8080/lamprey-configurator/`
2. You should see the Lamprey configurator interface
3. Select a mission from the dropdown (e.g., "Seabed Mine Neutralization")
4. Compatible payloads will appear in the table
5. Check some payloads and click "Generate Mission Configuration"

---

## Troubleshooting

### "Database connection failed"
- Make sure MySQL is running in XAMPP
- Check that database name is `lamprey_config`
- Default username is `root` with empty password

### "Failed to load missions"
- Open phpMyAdmin and verify tables were created
- Check that `missions` table has 8 entries
- Verify `payloads` table has 15 entries

### Apache won't start
- **Skype conflict:** Close Skype (uses port 80)
- **IIS conflict:** Stop IIS service in Windows
- **Alternative:** Change Apache to port 8080 (see Step 1)

### Page shows but no data loads
- Open browser console (F12)
- Check for JavaScript errors
- Verify API files are in the `api/` folder
- Check file permissions (should be readable)

---

## Making It Public (Deployment Options)

### Option 1: Free Hosting (Testing Only)
**InfinityFree** or **000webhost**
- Sign up for free account
- Upload files via FTP
- Import database through phpMyAdmin
- Update `config/database.php` with new credentials

### Option 2: Paid Hosting (Recommended)
**DigitalOcean App Platform ($5-12/mo)**
1. Create DigitalOcean account
2. Deploy from GitHub repository
3. Add managed MySQL database
4. Update database credentials
5. Get public URL

**AWS Lightsail ($3.50-5/mo)**
1. Launch LAMP instance
2. Upload files via SFTP
3. Create MySQL database
4. Configure Apache virtual host
5. Get static IP address

### Option 3: Quick Share (ngrok)
For instant public sharing:
```bash
1. Download ngrok: https://ngrok.com/download
2. Run: ngrok http 8080
3. Share the https:// URL provided
4. Temporary URL (resets on restart)
```

---

## Next Steps

1. **Customize data:** Edit `database_setup.sql` to add more missions/payloads
2. **Add images:** Replace payload bay placeholder with actual NX render
3. **Export feature:** Add PDF generation using TCPDF library
4. **Authentication:** Add password protection for sensitive use
5. **Analytics:** Track configuration patterns

---

## File Structure Reference

```
lamprey-configurator/
│
├── index.html              # Main interface
├── database_setup.sql      # Database schema + seed data
│
├── config/
│   └── database.php        # DB connection config
│
├── api/                    # Backend endpoints
│   ├── get_missions.php
│   ├── get_compatible_payloads.php
│   └── generate_config.php
│
├── css/
│   └── style.css           # All styling
│
└── js/
    └── app.js              # Frontend logic
```

---

## Support

If you encounter issues:
1. Check XAMPP error logs: `xampp/apache/logs/error.log`
2. Check PHP errors: Enable `display_errors` in `php.ini`
3. Browser console: Press F12 to see JavaScript errors
4. Database logs: Check phpMyAdmin SQL tab

---

## Database Schema Quick Reference

**missions table:**
- Stores mission types (ISR, Strike, etc.)
- Defines constraints (weight, power, volume limits)

**payloads table:**
- All available payload modules
- Technical specs and manufacturer info

**compatibility_rules table:**
- Links missions to compatible payloads
- Priority ranking system

**interfaces table:**
- Standard communication protocols
- MIL-STD specifications

---

**System is fully functional and ready for deployment!**
