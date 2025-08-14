import { generateId } from '@/lib/utils';
import { Organization, Vendor, Project, Drawing, SignType, Sign } from '@/lib/zod/schemas';

// Seed Organizations
export const seedOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Acme Corporation',
    logoUrl: '/images/logo-acme.png',
  },
  {
    id: 'org-2',
    name: 'Global Industries',
    logoUrl: '/images/logo-global.png',
  },
  {
    id: 'org-3',
    name: 'Tech Solutions Inc.',
    logoUrl: '/images/logo-tech.png',
  },
];

// Seed Vendors
export const seedVendors: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'Premier Signs & Graphics',
    type: 'production',
    contact: {
      name: 'John Smith',
      email: 'john@premiersigns.com',
      phone: '(555) 123-4567',
    },
    leadTimeDays: 14,
  },
  {
    id: 'vendor-2',
    name: 'Express Graphics',
    type: 'production',
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah@expressgraphics.com',
      phone: '(555) 234-5678',
    },
    leadTimeDays: 10,
  },
  {
    id: 'vendor-3',
    name: 'Quality Signs Co.',
    type: 'production',
    contact: {
      name: 'Mike Wilson',
      email: 'mike@qualitysigns.com',
      phone: '(555) 345-6789',
    },
    leadTimeDays: 21,
  },
  {
    id: 'vendor-4',
    name: 'Install Pro Services',
    type: 'install',
    contact: {
      name: 'Lisa Davis',
      email: 'lisa@installpro.com',
      phone: '(555) 456-7890',
    },
    leadTimeDays: 7,
  },
  {
    id: 'vendor-5',
    name: 'Mount Masters',
    type: 'install',
    contact: {
      name: 'Tom Brown',
      email: 'tom@mountmasters.com',
      phone: '(555) 567-8901',
    },
    leadTimeDays: 5,
  },
  {
    id: 'vendor-6',
    name: 'Sign Install Solutions',
    type: 'install',
    contact: {
      name: 'Amy Rodriguez',
      email: 'amy@signinstall.com',
      phone: '(555) 678-9012',
    },
    leadTimeDays: 3,
  },
];

// Seed Projects
export const seedProjects: Project[] = [
  {
    id: 'project-1',
    orgId: 'org-1',
    name: 'Downtown Office Complex',
    clientName: 'Acme Corp',
    location: {
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      timezone: 'America/New_York',
    },
    status: 'active',
    vendors: {
      productionVendorId: 'vendor-1',
      installVendorId: 'vendor-4',
    },
    stats: {
      signsTotal: 45,
      signsInstalled: 12,
    },
    estimate: {
      subtotal: 125000,
      taxRate: 0.08,
      total: 135000,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'project-2',
    orgId: 'org-1',
    name: 'Shopping Mall Renovation',
    clientName: 'Mall Properties LLC',
    location: {
      address: '456 Commerce Blvd',
      city: 'Los Angeles',
      state: 'CA',
      timezone: 'America/Los_Angeles',
    },
    status: 'planning',
    vendors: {
      productionVendorId: 'vendor-2',
      installVendorId: 'vendor-5',
    },
    stats: {
      signsTotal: 78,
      signsInstalled: 0,
    },
    estimate: {
      subtotal: 210000,
      taxRate: 0.08,
      total: 226800,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'project-3',
    orgId: 'org-2',
    name: 'Hospital Wayfinding System',
    clientName: 'City General Hospital',
    location: {
      address: '789 Health Center Dr',
      city: 'Chicago',
      state: 'IL',
      timezone: 'America/Chicago',
    },
    status: 'active',
    vendors: {
      productionVendorId: 'vendor-3',
      installVendorId: 'vendor-6',
    },
    stats: {
      signsTotal: 156,
      signsInstalled: 89,
    },
    estimate: {
      subtotal: 320000,
      taxRate: 0.08,
      total: 345600,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'project-4',
    orgId: 'org-2',
    name: 'University Campus Signage',
    clientName: 'State University',
    location: {
      address: '321 Education Ave',
      city: 'Austin',
      state: 'TX',
      timezone: 'America/Chicago',
    },
    status: 'on_hold',
    vendors: {
      productionVendorId: 'vendor-1',
      installVendorId: 'vendor-4',
    },
    stats: {
      signsTotal: 234,
      signsInstalled: 45,
    },
    estimate: {
      subtotal: 450000,
      taxRate: 0.08,
      total: 486000,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'project-5',
    orgId: 'org-3',
    name: 'Airport Terminal Signs',
    clientName: 'Metro Airport Authority',
    location: {
      address: '654 Aviation Way',
      city: 'Miami',
      state: 'FL',
      timezone: 'America/New_York',
    },
    status: 'active',
    vendors: {
      productionVendorId: 'vendor-2',
      installVendorId: 'vendor-5',
    },
    stats: {
      signsTotal: 89,
      signsInstalled: 67,
    },
    estimate: {
      subtotal: 180000,
      taxRate: 0.08,
      total: 194400,
    },
    updatedAt: new Date().toISOString(),
  },
];

// Seed Drawings
export const seedDrawings: Drawing[] = [
  {
    id: 'drawing-1',
    projectId: 'project-1',
    name: 'Ground Floor Plan',
    shortCode: 'GF-01',
    fileUrl: '/sample-pdfs/ground-floor-plan.pdf',
    pages: 1,
    scale: {
      units: 'imperial',
      ratioText: '1in=20ft',
    },
    version: 1,
  },
  {
    id: 'drawing-2',
    projectId: 'project-1',
    name: 'Second Floor Plan',
    shortCode: 'SF-01',
    fileUrl: '/sample-pdfs/second-floor-plan.pdf',
    pages: 1,
    scale: {
      units: 'imperial',
      ratioText: '1in=20ft',
    },
    version: 1,
  },
  {
    id: 'drawing-3',
    projectId: 'project-2',
    name: 'Mall Floor Plan',
    shortCode: 'MF-01',
    fileUrl: '/sample-pdfs/mall-floor-plan.pdf',
    pages: 2,
    scale: {
      units: 'imperial',
      ratioText: '1in=50ft',
    },
    version: 1,
  },
  {
    id: 'drawing-4',
    projectId: 'project-3',
    name: 'Hospital Main Building',
    shortCode: 'HB-01',
    fileUrl: '/sample-pdfs/hospital-main.pdf',
    pages: 3,
    scale: {
      units: 'imperial',
      ratioText: '1in=30ft',
    },
    version: 1,
  },
  {
    id: 'drawing-5',
    projectId: 'project-4',
    name: 'Campus Map',
    shortCode: 'CM-01',
    fileUrl: '/sample-pdfs/campus-map.pdf',
    pages: 1,
    scale: {
      units: 'imperial',
      ratioText: '1in=100ft',
    },
    version: 1,
  },
];

// Seed Sign Types
export const seedSignTypes: SignType[] = [
  {
    id: 'sign-type-1',
    projectId: 'project-1',
    code: 'ADA-001',
    name: 'ADA Room Identification',
    size: { w: 12, h: 8, units: 'in' },
    materials: 'Acrylic with Braille',
    basePrice: 85.00,
    color: '#2E86AB',
  },
  {
    id: 'sign-type-2',
    projectId: 'project-1',
    code: 'DIR-001',
    name: 'Directional Arrow',
    size: { w: 18, h: 6, units: 'in' },
    materials: 'Aluminum with vinyl graphics',
    basePrice: 45.00,
    color: '#A23B72',
  },
  {
    id: 'sign-type-3',
    projectId: 'project-2',
    code: 'STORE-001',
    name: 'Store Front Sign',
    size: { w: 8, h: 4, units: 'ft' },
    materials: 'LED illuminated channel letters',
    basePrice: 1200.00,
    color: '#F18F01',
  },
  {
    id: 'sign-type-4',
    projectId: 'project-3',
    code: 'WAY-001',
    name: 'Wayfinding Sign',
    size: { w: 24, h: 12, units: 'in' },
    materials: 'Aluminum with digital print',
    basePrice: 125.00,
    color: '#C73E1D',
  },
  {
    id: 'sign-type-5',
    projectId: 'project-4',
    code: 'BUILD-001',
    name: 'Building Identification',
    size: { w: 6, h: 3, units: 'ft' },
    materials: 'Stainless steel with engraved text',
    basePrice: 850.00,
    color: '#3B1F2B',
  },
];

// Seed Signs
export const seedSigns: Sign[] = [
  {
    id: 'sign-1',
    projectId: 'project-1',
    signTypeId: 'sign-type-1',
    drawingId: 'drawing-1',
    page: 1,
    xNorm: 0.25,
    yNorm: 0.35,
    stage: 'production',
    reviewStatus: 'approved',
    comments: [],
  },
  {
    id: 'sign-2',
    projectId: 'project-1',
    signTypeId: 'sign-type-1',
    drawingId: 'drawing-1',
    page: 1,
    xNorm: 0.45,
    yNorm: 0.35,
    stage: 'installation',
    reviewStatus: 'approved',
    comments: [],
  },
  {
    id: 'sign-3',
    projectId: 'project-1',
    signTypeId: 'sign-type-2',
    drawingId: 'drawing-1',
    page: 1,
    xNorm: 0.65,
    yNorm: 0.25,
    stage: 'takeoffs',
    reviewStatus: 'pending',
    comments: [],
  },
  {
    id: 'sign-4',
    projectId: 'project-2',
    signTypeId: 'sign-type-3',
    drawingId: 'drawing-3',
    page: 1,
    xNorm: 0.15,
    yNorm: 0.45,
    stage: 'planning',
    reviewStatus: 'pending',
    comments: [],
  },
  {
    id: 'sign-5',
    projectId: 'project-3',
    signTypeId: 'sign-type-4',
    drawingId: 'drawing-4',
    page: 1,
    xNorm: 0.35,
    yNorm: 0.55,
    stage: 'complete',
    reviewStatus: 'approved',
    comments: [],
  },
];

// Function to check if data is already seeded
export const isDataSeeded = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const projectsData = localStorage.getItem('projects-storage');
  if (!projectsData) return false;
  
  const parsed = JSON.parse(projectsData);
  return parsed.state.projects.length > 0;
};

// Function to seed all data
export const seedAllData = () => {
  if (typeof window === 'undefined') return;
  
  // Import stores dynamically to avoid SSR issues
  import('@/lib/store/projects-store').then(({ useProjectsStore }) => {
    const { setProjects, setDrawings } = useProjectsStore.getState();
    setProjects(seedProjects);
    setDrawings(seedDrawings);
  });

  import('@/lib/store/signs-store').then(({ useSignsStore }) => {
    const { setSigns, setSignTypes } = useSignsStore.getState();
    setSigns(seedSigns);
    setSignTypes(seedSignTypes);
  });
};
