export const DEFAULT_QUOTE_RULES = {
  pricing: {
    "Locked Out": { min: 75, max: 120 },
    "Lost Keys": { min: 80, max: 150 },
    "Broken Key": { min: 70, max: 130 },
    "Lock Replacement": { min: 90, max: 180 },
    "Lock Repair": { min: 80, max: 140 },
    "UPVC Door Lock": { min: 95, max: 175 },
    "Security Upgrade": { min: 120, max: 250 },
    "Commercial Locksmith": { min: 150, max: 350 }
  },
  multipliers: {
    property: {
      "House": 1.0,
      "Flat": 1.0,
      "Office": 1.2,
      "Retail": 1.3,
      "Commercial Unit": 1.4
    },
    urgency: {
      "Emergency": 1.3,
      "Same Day": 1.1,
      "Flexible": 1.0
    }
  }
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
  emailEnabled: true,
  smsEnabled: true,
  dashboardEnabled: true
};

export const DEFAULT_EMAIL_TEMPLATES = {
  leadNotification: `
    <h3>New Locksmith Lead Captured!</h3>
    <p><strong>Name:</strong> {{name}}</p>
    <p><strong>Phone:</strong> {{phone}}</p>
    <p><strong>Email:</strong> {{email}}</p>
    <p><strong>Postcode:</strong> {{postcode}}</p>
    <p><strong>Service Requested:</strong> {{serviceType}}</p>
    <p><strong>Property Type:</strong> {{propertyType}}</p>
    <p><strong>Urgency:</strong> {{urgency}}</p>
    <p><strong>Estimated Price:</strong> £{{minPrice}} - £{{maxPrice}}</p>
    <p><strong>Message:</strong> {{message}}</p>
  `
};

export const DEFAULT_SMS_TEMPLATES = {
  leadNotification: "New Lead! {{name}} requests {{serviceType}} ({{urgency}}). Phone: {{phone}}. Estimate: £{{minPrice}}-£{{maxPrice}}"
};
