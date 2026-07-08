import { useState } from 'react';

interface AIDirectorConsoleProps {
  token: string;
}

export function AIDirectorConsole({ token }: AIDirectorConsoleProps) {
  const [commandInput, setCommandInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '🤖 Academix OS AI Agent Director Console [Version 2.4.0]',
    '🔒 Connection secure. Autopilot sub-routines active.',
    '--------------------------------------------------------',
    'Ready for administrative delegation commands...'
  ]);
  const [executing, setExecuting] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [listening, setListening] = useState(false);

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      appendLogs(['[Speech Recognizer] Listening for voice commands...']);
    };

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setCommandInput(resultText);
      appendLogs([`[Speech Recognizer] Translated: "${resultText}"`]);
    };

    recognition.onerror = () => {
      setListening(false);
      appendLogs(['[Speech Recognizer] Speech recognition session ended with error/silence.']);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const [toggles, setToggles] = useState({
    bids: true,
    crew: true,
    waivers: false,
    meetings: true
  });

  const appendLogs = (lines: string[]) => {
    setTerminalLogs(prev => [...prev, ...lines]);
  };

  const handleExecuteCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    setExecuting(true);
    const cmd = commandInput.trim();
    setCommandInput('');
    appendLogs([`$ execute "${cmd}"`, `[AI Director] Parsing execution parameters...`]);

    try {
      const res = await fetch('/api/ai/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      appendLogs(data.trace.map((t: string) => `✔️ ${t}`));
    } catch (err: any) {
      appendLogs([`❌ Execution failed: ${err.message}`]);
    } finally {
      setExecuting(false);
    }
  };

  const handleAuditScan = async () => {
    setAuditing(true);
    appendLogs(['$ run telemetry-anomaly-audit', '[AI Director] Scanning active SQLite database indexes...', '[AI Director] Analyzing IoT flows and student infraction triggers...']);

    try {
      const res = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      appendLogs(data.trace.map((t: string) => `⚡ ${t}`));
      appendLogs(['[AI Director] Audit scan successfully completed. Registers synced.']);
    } catch (err: any) {
      appendLogs([`❌ Telemetry audit failed: ${err.message}`]);
    } finally {
      setAuditing(false);
    }
  };

  const handleClearLogs = () => {
    setTerminalLogs([
      '🤖 Academix OS AI Agent Director Console [Version 2.4.0]',
      'Ready for administrative delegation commands...'
    ]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 2fr', gap: '2rem' }} className="responsive-grid-125-2">
      
      {/* Autopilot settings */}
      <div className="glass-card" style={{ padding: '1.75rem', height: 'fit-content' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🛡️</span> AI Autopilot Authority
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Enable dynamic decision-making and writing authority in database scopes.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-primary)' }}>Auto-Approve Vendor Bids</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Accept lowest rate automatically</span>
            </div>
            <input
              type="checkbox"
              checked={toggles.bids}
              onChange={(e) => setToggles(p => ({ ...p, bids: e.target.checked }))}
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-primary)' }}>Auto-Deploy Crew</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Dispatch crew on IoT water/power leaks</span>
            </div>
            <input
              type="checkbox"
              checked={toggles.crew}
              onChange={(e) => setToggles(p => ({ ...p, crew: e.target.checked }))}
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-primary)' }}>Auto-Waive Balances</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Grant credits waivers on outstanding fees</span>
            </div>
            <input
              type="checkbox"
              checked={toggles.waivers}
              onChange={(e) => setToggles(p => ({ ...p, waivers: e.target.checked }))}
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-primary)' }}>Auto-Schedule Consultations</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Schedule parent meetings on critical alerts</span>
            </div>
            <input
              type="checkbox"
              checked={toggles.meetings}
              onChange={(e) => setToggles(p => ({ ...p, meetings: e.target.checked }))}
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
          onClick={handleAuditScan}
          disabled={auditing}
        >
          {auditing ? 'Auditing Telemetry...' : '⚡ Scan Telemetry & Anomalies'}
        </button>
      </div>

      {/* Terminal Command Console */}
      <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', background: 'rgba(2, 6, 23, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)' }}>
              <span>📟</span> AI Executive Control Console
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Command compiler executing plain text instructions directly on system registries.</p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={handleClearLogs}>
            Clear logs
          </button>
        </div>

        {/* Terminal Log */}
        <div
          style={{
            flex: 1,
            background: '#020617',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '1rem',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            color: '#10b981',
            overflowY: 'auto',
            height: '240px',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}
        >
          {terminalLogs.map((log, idx) => (
            <div key={idx} style={{ wordBreak: 'break-all', opacity: log.startsWith('$') ? 0.9 : 0.75 }}>
              {log}
            </div>
          ))}
        </div>

        <form onSubmit={handleExecuteCommand} style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem', color: 'var(--primary)', alignSelf: 'center', fontFamily: 'monospace' }}>$</span>
          <input
            type="text"
            className="form-control"
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.85rem',
              background: '#020617',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontFamily: 'monospace'
            }}
            placeholder="e.g. Deployed crew to pending locker tickets"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            disabled={executing}
          />
          <button
            type="button"
            className={`btn ${listening ? 'btn-danger' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 0.85rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={startVoiceDictation}
            title="Voice Dictation Command Parser"
          >
            🎤
          </button>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} disabled={executing}>
            {executing ? 'Executing...' : 'Run'}
          </button>
        </form>
      </div>

    </div>
  );
}
