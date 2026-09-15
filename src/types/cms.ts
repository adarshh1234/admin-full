export interface SectionVisibility {
  hero: boolean;
  cinematicShowcase: boolean;
  statsAndShift: boolean;
  coreFeatures: boolean;
  dimensions: boolean;
  blogMatrix: boolean;
  videoHub: boolean;
  whyAndTestimonials: boolean;
  finalCTA: boolean;
}

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface NavbarContent {
  brandName: string;
  brandHighlight: string;
  badge: string;
  navLinks: NavLinkItem[];
  signInText: string;
  ctaButtonText: string;
}

export interface CandidateProfile {
  initials: string;
  name: string;
  role: string;
  fitScore: string;
  interviewStatus: string;
  interviewDuration: string;
  portfolioStatus: string;
  portfolioRating: string;
  ranking: string;
  tier: string;
  activeBids: string;
  offerCompany: string;
  offerDetails: string;
}

export interface HeroContent {
  tagBadge: string;
  headlineLine1: string;
  headlineLine2Gradient: string;
  subtitle: string;
  subtitleHighlight: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  proofBadges: string[];
  profiles: CandidateProfile[];
}

export interface CinematicShowcaseContent {
  topHeading: string;
  topBadge: string;
  videoUrls: string[];
  posterImage: string;
  stats: {
    matchRate: string;
    assessmentVolume: string;
    averageSalary: string;
  };
  liveRoles: Array<{
    title: string;
    comp: string;
    company: string;
    status: string;
  }>;
}

export interface StatItem {
  value: string;
  label: string;
  sub: string;
}

export interface ComparisonPoint {
  label: string;
  desc: string;
}

export interface LiveMarketRole {
  title: string;
  rate: string;
  status: string;
  field: string;
}

export interface StatsAndShiftContent {
  stats: StatItem[];
  sectionTag: string;
  headingLine1: string;
  headingLine2Gradient: string;
  subtitle: string;
  subtitleHighlight: string;
  oldWay: {
    title: string;
    subtitle: string;
    points: ComparisonPoint[];
    statusText: string;
  };
  letGetInWay: {
    title: string;
    badge: string;
    subtitle: string;
    points: ComparisonPoint[];
  };
  liveRoles: LiveMarketRole[];
}

export interface FeatureCard {
  id: number;
  iconName: string;
  title: string;
  description: string;
  tag: string;
}

export interface CorePlatformOSContent {
  sectionTag: string;
  title: string;
  titleHighlight: string;
  titleSuffix: string;
  subtitle: string;
  features: FeatureCard[];
}

export interface DimensionCard {
  num: string;
  title: string;
  description: string;
}

export interface DimensionsOfTalentContent {
  sectionTag: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  dimensions: DimensionCard[];
  expertInsight: string;
}

export interface ArticleItem {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  featured: boolean;
  badge: string;
}

export interface BlogMatrixContent {
  sectionTag: string;
  title: string;
  categories: string[];
  articles: ArticleItem[];
}

export interface VideoItem {
  id: number;
  title: string;
  duration: string;
  category: string;
  speaker: string;
  description: string;
  badge: string;
  tag: string;
}

export interface VideoContentSectionContent {
  sectionTag: string;
  title: string;
  subtitle: string;
  videoList: VideoItem[];
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  initials: string;
  rating: number;
}

export interface WhyAndTestimonialsContent {
  whyTag: string;
  whyTitle: string;
  whySubtitle: string;
  othersProblemPoints: string[];
  letGetInSolutionPoints: string[];
  testimonialsTag: string;
  testimonialsTitle: string;
  testimonialsTitleHighlight: string;
  testimonialsTitleSuffix: string;
  testimonialsList: TestimonialItem[];
}

export interface FinalCTAContent {
  badge: string;
  headline: string;
  subtitle: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  microAssurances: string[];
}

export interface SocialLinkItem {
  label: string;
  href: string;
}

export interface FooterContent {
  brandDescription: string;
  statusText: string;
  copyright: string;
  complianceText: string;
  socialLinks: SocialLinkItem[];
}

export interface LandingPageCmsData {
  status: 'draft' | 'published';
  publishedAt?: string;
  updatedAt?: string;
  sectionVisibility: SectionVisibility;
  navbar: NavbarContent;
  hero: HeroContent;
  cinematicVideoShowcase: CinematicShowcaseContent;
  statsAndShift: StatsAndShiftContent;
  corePlatformOS: CorePlatformOSContent;
  dimensionsOfTalent: DimensionsOfTalentContent;
  blogMatrix: BlogMatrixContent;
  videoContent: VideoContentSectionContent;
  whyAndTestimonials: WhyAndTestimonialsContent;
  finalCTA: FinalCTAContent;
  footer: FooterContent;
}
