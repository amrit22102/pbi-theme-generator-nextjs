'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/themeStore';
import { TEMPLATES } from '@/store/templateStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './home.module.css';

export default function HomePage() {
  const router = useRouter();
  const applyTemplate = useThemeStore((s) => s.applyTemplate);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      applyTemplate(JSON.parse(JSON.stringify(template.customization)));
      setShowTemplates(false);
      router.push('/editor');
    }
  };

  const handleCustomCreate = () => {
    router.push('/editor');
  };

  return (
    <div className={styles.page}>
      <div className="mesh-gradient-bg" />

      {/* ─── Navbar ─── */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <div className={styles.navLogoIcon}>⚡</div>
          <span className="gradient-text">Theme Studio</span>
        </div>
        <div className={styles.navRight}>
          <ThemeToggle />
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>✨ Power BI Theme Designer</div>
        <h1 className={styles.heroTitle}>
          Design Stunning
          <br />
          <span className="gradient-text">Power BI Themes</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Create professional theme configurations visually. Choose from curated
          templates or build your own with live preview, then export as
          Power BI-compatible JSON in one click.
        </p>

        {/* ─── CTA Cards ─── */}
        <div className={styles.ctaGrid}>
          <div
            className={`${styles.ctaCard} ${styles.ctaTemplates} glass-card glass-card-hover`}
            onClick={() => {
              setShowTemplates(true);
            }}
            id="cta-templates"
          >
            <div className={styles.ctaIcon}>🎨</div>
            <h2 className={styles.ctaTitle}>Browse Templates</h2>
            <p className={styles.ctaDesc}>
              Start from 8 professionally designed themes — corporate, dark mode,
              analytics, sustainability, and more.
            </p>
            <div className={styles.ctaArrow}>
              Explore Templates <span>→</span>
            </div>
          </div>

          <div
            className={`${styles.ctaCard} ${styles.ctaCustom} glass-card glass-card-hover`}
            onClick={() => {
              handleCustomCreate();
            }}
            id="cta-custom"
          >
            <div className={styles.ctaIcon}>🛠️</div>
            <h2 className={styles.ctaTitle}>Create Custom Theme</h2>
            <p className={styles.ctaDesc}>
              Start from scratch with full control over colors, fonts, axes,
              legends, and every visual property.
            </p>
            <div className={styles.ctaArrow}>
              Open Editor <span>→</span>
            </div>
          </div>

          <div
            className={`${styles.ctaCard} ${styles.ctaLive} glass-card glass-card-hover`}
            onClick={() => router.push('/live-preview')}
            id="cta-live-preview"
          >
            <div className={styles.ctaIcon}>📊</div>
            <h2 className={styles.ctaTitle}>Live Preview Report</h2>
            <p className={styles.ctaDesc}>
              Embed a real Power BI report and preview your theme changes
              applied in real-time on live data.
            </p>
            <div className={styles.ctaArrow}>
              Launch Preview <span>→</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className={styles.features}>
        <p className={styles.featuresTitle}>Why Theme Studio</p>
        <div className={styles.featuresGrid}>
          {[
            { emoji: '🎨', label: 'Visual Designer', desc: 'Intuitive UI — no manual JSON editing required' },
            { emoji: '👁️', label: 'Live Preview', desc: '19 chart types rendered in real-time as you customize' },
            { emoji: '📦', label: 'Pro Templates', desc: '8 industry-standard themes with best practices built in' },
            { emoji: '⚡', label: 'One-Click Export', desc: 'Generate production-ready Power BI JSON theme files' },
            { emoji: '🔄', label: 'Consistent Branding', desc: 'Apply your brand across the entire Power BI ecosystem' },
            { emoji: '✅', label: 'JSON Validation', desc: 'Pre-export validation ensures your theme file is valid' },
          ].map((f) => (
            <div className={styles.featureItem} key={f.label}>
              <span className={styles.featureEmoji}>{f.emoji}</span>
              <div className={styles.featureLabel}>{f.label}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Template Gallery Modal ─── */}
      {showTemplates && (
        <div className={styles.modalOverlay} onClick={() => setShowTemplates(false)}>
          <div
            className={`${styles.modalContent} glass-card`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.modalClose} onClick={() => setShowTemplates(false)}>
              ✕
            </button>
            <h2 className={styles.modalTitle}>Choose a Template</h2>
            <p className={styles.modalSubtitle}>
              Select a pre-designed theme to start with. You can customize every detail after.
            </p>
            <div className={styles.templateGrid}>
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  className={styles.templateCard}
                  onClick={() => handleTemplateSelect(t.id)}
                  id={`template-${t.id}`}
                >
                  {/* Full data color palette bar */}
                  <div className={styles.paletteBar}>
                    {t.customization.colors.dataColors.map((c, i) => (
                      <div
                        key={i}
                        className={styles.paletteSegment}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  {/* Semantic colors row */}
                  <div className={styles.semanticRow}>
                    <div className={styles.semanticChip}>
                      <span
                        className={styles.semanticDot}
                        style={{ backgroundColor: t.customization.colors.good }}
                      />
                      Good
                    </div>
                    <div className={styles.semanticChip}>
                      <span
                        className={styles.semanticDot}
                        style={{ backgroundColor: t.customization.colors.neutral }}
                      />
                      Neutral
                    </div>
                    <div className={styles.semanticChip}>
                      <span
                        className={styles.semanticDot}
                        style={{ backgroundColor: t.customization.colors.bad }}
                      />
                      Bad
                    </div>
                  </div>

                  <div className={styles.templateCategory}>{t.category}</div>
                  <div className={styles.templateName}>{t.name}</div>
                  <div className={styles.templateDesc}>{t.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
