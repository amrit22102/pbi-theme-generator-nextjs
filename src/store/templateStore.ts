import { TemplateTheme, ThemeCustomization } from '@/types/theme';
import { DEFAULT_CUSTOMIZATION } from '@/lib/baseTheme';

function makeTemplate(
  id: string,
  name: string,
  description: string,
  category: string,
  overrides: Partial<ThemeCustomization> & { colors?: Partial<ThemeCustomization['colors']>; font?: Partial<ThemeCustomization['font']> }
): TemplateTheme {
  const base = JSON.parse(JSON.stringify(DEFAULT_CUSTOMIZATION)) as ThemeCustomization;
  const customization: ThemeCustomization = {
    ...base,
    ...overrides,
    name: id,
    colors: { ...base.colors, ...overrides.colors },
    font: { ...base.font, ...overrides.font },
  };
  return {
    id,
    name,
    description,
    category,
    previewColors: customization.colors.dataColors.slice(0, 6),
    customization,
  };
}

export const TEMPLATES: TemplateTheme[] = [
  makeTemplate(
    'corporate-blue',
    'Corporate Blue',
    'Professional blue palette suited for enterprise dashboards and executive reporting.',
    'Enterprise',
    {
      colors: {
        dataColors: ['#0063B1', '#2D7DD2', '#97CC04', '#F45D01', '#474973', '#8B8BAE', '#FFD166', '#EF476F', '#06D6A0', '#118AB2'],
        foreground: '#1B2A4A',
        foregroundNeutralSecondary: '#5A6B8A',
        foregroundNeutralTertiary: '#A0ABC0',
        tableAccent: '#0063B1',
        good: '#06D6A0',
        neutral: '#FFD166',
        bad: '#EF476F',
        maximum: '#0063B1',
        center: '#FFD166',
        minimum: '#D6EEFF',
        background: '#FFFFFF',
        backgroundLight: '#F0F4FA',
        backgroundNeutral: '#D1DAE8',
      },
      font: { fontFamily: 'Segoe UI', fontSize: 10, fontColor: '#1B2A4A' },
    }
  ),

  makeTemplate(
    'dark-executive',
    'Dark Executive',
    'Sleek dark theme with high contrast for executive-level presentations and C-suite dashboards.',
    'Executive',
    {
      colors: {
        dataColors: ['#00D4AA', '#7C5CFF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94', '#6C5CE7', '#FDCB6E', '#0984E3'],
        foreground: '#E8E8E8',
        foregroundNeutralSecondary: '#A0A0A0',
        foregroundNeutralTertiary: '#686868',
        tableAccent: '#00D4AA',
        good: '#00D4AA',
        neutral: '#FFE66D',
        bad: '#FF6B6B',
        maximum: '#7C5CFF',
        center: '#FFE66D',
        minimum: '#1A2332',
        background: '#0D1117',
        backgroundLight: '#161B22',
        backgroundNeutral: '#30363D',
      },
      font: { fontFamily: 'Segoe UI', fontSize: 10, fontColor: '#E8E8E8' },
    }
  ),

  makeTemplate(
    'warm-analytics',
    'Warm Analytics',
    'Warm amber and orange tones designed for financial and analytics reporting.',
    'Finance',
    {
      colors: {
        dataColors: ['#E8590C', '#D9480F', '#F76707', '#FD7E14', '#FF922B', '#FFC078', '#F59F00', '#FAB005', '#40C057', '#1098AD'],
        foreground: '#2C1810',
        foregroundNeutralSecondary: '#6B4F3A',
        foregroundNeutralTertiary: '#B8A090',
        tableAccent: '#E8590C',
        good: '#40C057',
        neutral: '#FAB005',
        bad: '#E8590C',
        maximum: '#D9480F',
        center: '#FAB005',
        minimum: '#FFF5EB',
        background: '#FFFFFF',
        backgroundLight: '#FFF8F0',
        backgroundNeutral: '#E8DDD4',
      },
      font: { fontFamily: 'Georgia', fontSize: 10, fontColor: '#2C1810' },
    }
  ),

  makeTemplate(
    'nature-green',
    'Nature Green',
    'Sustainability-focused green palette for ESG reporting and environmental dashboards.',
    'Sustainability',
    {
      colors: {
        dataColors: ['#2B8A3E', '#37B24D', '#51CF66', '#8CE99A', '#087F5B', '#0CA678', '#20C997', '#96F2D7', '#364FC7', '#748FFC'],
        foreground: '#1A3A1A',
        foregroundNeutralSecondary: '#4A6B4A',
        foregroundNeutralTertiary: '#8FAF8F',
        tableAccent: '#2B8A3E',
        good: '#2B8A3E',
        neutral: '#F59F00',
        bad: '#E03131',
        maximum: '#087F5B',
        center: '#F59F00',
        minimum: '#EBFBEE',
        background: '#FFFFFF',
        backgroundLight: '#F0FAF0',
        backgroundNeutral: '#C8E6C9',
      },
      font: { fontFamily: 'Calibri', fontSize: 10, fontColor: '#1A3A1A' },
    }
  ),

  makeTemplate(
    'vivid-modern',
    'Vivid Modern',
    'Bold, vibrant color palette for marketing dashboards and creative presentations.',
    'Marketing',
    {
      colors: {
        dataColors: ['#7950F2', '#F03E3E', '#1098AD', '#F76707', '#37B24D', '#E64980', '#F59F00', '#4C6EF5', '#AE3EC9', '#20C997'],
        foreground: '#212529',
        foregroundNeutralSecondary: '#495057',
        foregroundNeutralTertiary: '#ADB5BD',
        tableAccent: '#7950F2',
        good: '#37B24D',
        neutral: '#F59F00',
        bad: '#F03E3E',
        maximum: '#7950F2',
        center: '#F59F00',
        minimum: '#F3F0FF',
        background: '#FFFFFF',
        backgroundLight: '#F8F9FA',
        backgroundNeutral: '#DEE2E6',
      },
      font: { fontFamily: 'DIN', fontSize: 10, fontColor: '#212529' },
    }
  ),

  makeTemplate(
    'monochrome',
    'Monochrome Elegance',
    'Sophisticated grayscale theme for minimalist designs and print-friendly reports.',
    'Classic',
    {
      colors: {
        dataColors: ['#212529', '#495057', '#868E96', '#ADB5BD', '#343A40', '#6C757D', '#CED4DA', '#DEE2E6', '#F1F3F5', '#E9ECEF'],
        foreground: '#212529',
        foregroundNeutralSecondary: '#6C757D',
        foregroundNeutralTertiary: '#ADB5BD',
        tableAccent: '#212529',
        good: '#2B8A3E',
        neutral: '#E67700',
        bad: '#C92A2A',
        maximum: '#212529',
        center: '#868E96',
        minimum: '#F8F9FA',
        background: '#FFFFFF',
        backgroundLight: '#F8F9FA',
        backgroundNeutral: '#DEE2E6',
      },
      font: { fontFamily: 'Segoe UI', fontSize: 10, fontColor: '#212529' },
    }
  ),

  makeTemplate(
    'sunset-gradient',
    'Sunset',
    'Warm sunset tones from coral to deep purple for visually striking presentations.',
    'Creative',
    {
      colors: {
        dataColors: ['#FF6F61', '#FF9671', '#FFC75F', '#F9F871', '#D65DB1', '#845EC2', '#FF6E4A', '#2C73D2', '#0089BA', '#008F7A'],
        foreground: '#2D1B30',
        foregroundNeutralSecondary: '#6B4F6E',
        foregroundNeutralTertiary: '#B299B5',
        tableAccent: '#FF6F61',
        good: '#008F7A',
        neutral: '#FFC75F',
        bad: '#FF6F61',
        maximum: '#845EC2',
        center: '#FFC75F',
        minimum: '#FFF0EE',
        background: '#FFFFFF',
        backgroundLight: '#FDF5F3',
        backgroundNeutral: '#E8D5E0',
      },
      font: { fontFamily: 'Trebuchet MS', fontSize: 10, fontColor: '#2D1B30' },
    }
  ),

  makeTemplate(
    'ocean-breeze',
    'Ocean Breeze',
    'Cool blue-green tones evoking calm and trust — ideal for healthcare and technology.',
    'Healthcare',
    {
      colors: {
        dataColors: ['#006D77', '#83C5BE', '#FFDDD2', '#E29578', '#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#023E8A'],
        foreground: '#0A2239',
        foregroundNeutralSecondary: '#456789',
        foregroundNeutralTertiary: '#8AABCC',
        tableAccent: '#006D77',
        good: '#2A9D8F',
        neutral: '#E9C46A',
        bad: '#E76F51',
        maximum: '#006D77',
        center: '#E9C46A',
        minimum: '#E0F7F7',
        background: '#FFFFFF',
        backgroundLight: '#F0F9F9',
        backgroundNeutral: '#C5E0E0',
      },
      font: { fontFamily: 'Verdana', fontSize: 10, fontColor: '#0A2239' },
    }
  ),
];
