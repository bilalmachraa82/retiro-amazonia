import 'dotenv/config';
import { google } from 'googleapis';

export const config = { runtime: 'nodejs', maxDuration: 10 };

/**
 * Captures a lead and appends it to a Google Sheet.
 * Env vars: GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_SHEET_ID
 */
export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, phone, interest, source, cidade, nascimento } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Fallback: If no credentials, log to console and return success
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON || !process.env.GOOGLE_SHEET_ID || process.env.GOOGLE_SERVICE_ACCOUNT_JSON === '{}') {
            console.log('Lead captured (No Sheets Configured):', { name, email, phone, interest, source, cidade, nascimento });
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.status(200).json({ success: true, warning: 'Lead saved to logs only (Sheets not configured)' });
        }

        const sheetId = process.env.GOOGLE_SHEET_ID;
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const timestamp = new Date().toISOString();
        const values = [[timestamp, name, email, phone || '', cidade || '', nascimento || '', interest || '', source || 'formulario']];

        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Leads!A:H',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });

        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Lead capture error:', error);
        return res.status(500).json({
            error: 'Failed to save lead',
            detail: error.message,
        });
    }
}
