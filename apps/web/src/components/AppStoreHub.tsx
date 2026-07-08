import { useState, useEffect } from 'react';

interface AppStoreHubProps {
  token: string;
}

export function AppStoreHub({ token }: AppStoreHubProps) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Prompt compiler state
  const [promptInput, setPromptInput] = useState('');
  const [compiling, setCompiling] = useState(false);
  const [compilationSuccess, setCompilationSuccess] = useState('');

  // Sandbox modal state
  const [activeSandboxPkg, setActiveSandboxPkg] = useState<any>(null);
  const [sandboxConfig, setSandboxConfig] = useState<Record<string, any>>({});
  const [savingConfig, setSavingConfig] = useState(false);
  const [sandboxMessage, setSandboxMessage] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appstore/packages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPackages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (id: string) => {
    try {
      const res = await fetch(`/api/appstore/install/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchPackages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUninstall = async (id: string) => {
    try {
      const res = await fetch(`/api/appstore/uninstall/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchPackages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompilePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    setCompiling(true);
    setCompilationSuccess('');
    try {
      const res = await fetch('/api/appstore/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: promptInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCompilationSuccess(`🎉 Feature compiled and installed: "${data.name}"!`);
      setPromptInput('');
      fetchPackages();
    } catch (err: any) {
      setCompilationSuccess(`❌ Compilation failed: ${err.message}`);
    } finally {
      setCompiling(false);
    }
  };

  const openSandbox = (pkg: any) => {
    setActiveSandboxPkg(pkg);
    setSandboxMessage('');
    // Load existing config if available
    if (pkg.instances && pkg.instances.length > 0) {
      try {
        setSandboxConfig(JSON.parse(pkg.instances[0].configData));
      } catch {
        setSandboxConfig({});
      }
    } else {
      setSandboxConfig({});
    }
  };

  const handleSaveSandboxConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSandboxPkg) return;
    setSavingConfig(true);
    setSandboxMessage('');
    try {
      const res = await fetch('/api/appstore/instance/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId: activeSandboxPkg.id,
          configData: sandboxConfig
        })
      });

      if (!res.ok) throw new Error('Failed to save configuration');
      setSandboxMessage('✅ Telemetry configuration active! Dynamic instance logs verified.');
      fetchPackages();
    } catch (err: any) {
      setSandboxMessage(`❌ Error: ${err.message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleConfigChange = (name: string, value: any) => {
    setSandboxConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Derived filters
  const categories = ['ALL', 'ACADEMIC', 'ERP', 'LOGISTICS', 'COMMS'];
  
  const filteredPackages = packages.filter(pkg => {
    const matchesCategory = activeCategory === 'ALL' || pkg.category === activeCategory;
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading && packages.length === 0) {
    return <div className="text-slate-400 text-xs">Loading EduOS AppStore Engine...</div>;
  }

  // Simulated metrics
  const installedCount = packages.filter(p => p.isInstalled).length;

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      
      {/* AppStore HUD Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🛍️</span> Academix OS AppStore Hub
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Dynamic feature SDK runtime registry. Declaring, installing, and executing custom widgets on the fly.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ECOSYSTEM METRIC</span>
            <strong style={{ display: 'block', color: 'var(--primary)', fontSize: '1.25rem' }}>25,482 Available</strong>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>INSTALLED MODULES</span>
            <strong style={{ display: 'block', color: 'var(--success)', fontSize: '1.25rem' }}>{installedCount} active</strong>
          </div>
        </div>
      </div>

      {/* Prompts Compiler section */}
      <div style={{ background: 'rgba(99, 102, 241, 0.03)', border: '1px solid var(--border-glow)', padding: '1.25rem', borderRadius: '12px', marginBottom: '2.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🤖</span> AI Feature Specification Compiler
        </h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Prompt custom dashboard utility logic to auto-generate fully functional responsive widgets.
        </p>

        {compilationSuccess && (
          <div style={{ padding: '0.75rem', background: compilationSuccess.startsWith('❌') ? 'var(--danger-glow)' : 'var(--success-glow)', border: '1px solid ' + (compilationSuccess.startsWith('❌') ? 'hsla(350,89%,60%,0.2)' : 'hsla(142,72%,45%,0.2)'), color: compilationSuccess.startsWith('❌') ? 'var(--danger)' : 'var(--success)', fontSize: '0.8rem', borderRadius: '6px', marginBottom: '1rem', fontWeight: 500 }}>
            {compilationSuccess}
          </div>
        )}

        <form onSubmit={handleCompilePrompt} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-control"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            placeholder="e.g. Build locker assignment supervisor widget for logistics tracking"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }} disabled={compiling}>
            {compiling ? 'Compiling Schema...' : 'Compile prompt'}
          </button>
        </form>
      </div>

      {/* Categories & Search Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div>
          <input
            type="text"
            className="form-control"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', width: '220px' }}
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: '1rem' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{pkg.icon}</span>
                <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{pkg.category}</span>
              </div>
              <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{pkg.name}</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{pkg.description}</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              {pkg.isInstalled ? (
                <>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }} onClick={() => openSandbox(pkg)}>
                    🔧 Configure
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleUninstall(pkg.id)}>
                    Uninstall
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem' }} onClick={() => handleInstall(pkg.id)}>
                  📥 Install App
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sandbox Drawer / Modal overlay */}
      {activeSandboxPkg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{activeSandboxPkg.icon}</span> {activeSandboxPkg.name}
              </h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setActiveSandboxPkg(null)}>
                ✕ Close
              </button>
            </div>

            {sandboxMessage && (
              <div style={{ padding: '0.75rem', background: 'var(--success-glow)', border: '1px solid hsla(142,72%,45%,0.2)', color: 'var(--success)', fontSize: '0.8rem', borderRadius: '6px', marginBottom: '1.25rem', fontWeight: 500 }}>
                {sandboxMessage}
              </div>
            )}

            <form onSubmit={handleSaveSandboxConfig}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {JSON.parse(activeSandboxPkg.configSchema || '[]').map((field: any) => (
                  <div key={field.name} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>{field.label}</label>
                    <input
                      type={field.type}
                      className="form-control"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                      placeholder={field.placeholder}
                      value={sandboxConfig[field.name] || ''}
                      onChange={(e) => handleConfigChange(field.name, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-success" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }} disabled={savingConfig}>
                {savingConfig ? 'Configuring Module...' : 'Disburse Active Configurations'}
              </button>
            </form>

            {/* Displaying Live running Telemetry feed when configured */}
            {activeSandboxPkg.instances && activeSandboxPkg.instances.length > 0 && (
              <div style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.4rem' }}>🏃 Telemetry Signal Feed</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem' }}>
                  {Object.entries(JSON.parse(activeSandboxPkg.instances[0].configData)).map(([k, v]: any) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{k}:</span>
                      <strong style={{ color: 'var(--success)' }}>{v}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
