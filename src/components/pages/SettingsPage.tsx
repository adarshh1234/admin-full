import { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { Button } from '../common/Button';

export function SettingsPage() {
  const { showToast } = useToast();
  const [language, setLanguage] = useState('English (US)');
  const [timezone, setTimezone] = useState('UTC +5:30');
  const [notifications, setNotifications] = useState('Enabled');
  const [theme, setTheme] = useState('Light');

  function handleSave() {
    showToast('Settings saved successfully!', 'success');
  }

  function handleReset() {
    setLanguage('English (US)');
    setTimezone('UTC +5:30');
    setNotifications('Enabled');
    setTheme('Light');
    showToast('Settings reset to default.', 'info');
  }

  return (
    <div className="panel module-detail" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="header">
        <div className="icon-lg">
          <i className="fas fa-cog" />
        </div>
        <h2>Settings</h2>
        <span className="tag-blue" style={{ marginLeft: 'auto', fontSize: 12 }}>
          Preferences
        </span>
      </div>

      <div className="fields">
        <div className="field-group half">
          <label>Language</label>
          <select
            className="form-control"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option>English (US)</option>
            <option>English (UK)</option>
            <option>Spanish</option>
            <option>German</option>
          </select>
        </div>
        <div className="field-group half">
          <label>Timezone</label>
          <select
            className="form-control"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            <option>UTC +5:30</option>
            <option>UTC +0:00</option>
            <option>UTC -5:00</option>
            <option>UTC +1:00</option>
          </select>
        </div>
        <div className="field-group half">
          <label>Notifications</label>
          <select
            className="form-control"
            value={notifications}
            onChange={(e) => setNotifications(e.target.value)}
          >
            <option>Enabled</option>
            <option>Disabled</option>
            <option>Important Only</option>
          </select>
        </div>
        <div className="field-group half">
          <label>Theme</label>
          <select
            className="form-control"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={handleSave}>
          <i className="fas fa-save" /> Save Settings
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset Default
        </Button>
      </div>
    </div>
  );
}

