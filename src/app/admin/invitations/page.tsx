'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  Search,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Users,
  MessageSquare,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Download,
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  CheckCircle2,
  ShieldAlert,
  Folder,
  Upload,
  Image as ImageIcon,
  Loader2,
  Smartphone,
} from 'lucide-react';
import { INVITATION_TEMPLATES } from '@/lib/invitations/templates';
import { VenueAutocompleteInput } from '@/components/invitations/VenueAutocompleteInput';
import { AdminMediaPickerModal } from '@/components/admin/AdminMediaPickerModal';
import { WeddingInvitationView } from '@/components/invitations/WeddingInvitationView';

interface InvitationRsvpItem {
  id: string;
  guestName: string;
  attendance: string;
  guestCount: number;
  side: string;
  wishMessage?: string | null;
  createdAt: string;
}

interface AdminInvitationItem {
  id: string;
  slug: string;
  templateId: string;
  themeColor: string;
  groomName: string;
  brideName: string;
  groomParents?: string | null;
  brideParents?: string | null;
  groomImage?: string | null;
  brideImage?: string | null;
  groomBio?: string | null;
  brideBio?: string | null;
  ceremonyDate: string;
  ceremonyTimeText?: string | null;
  venueName: string;
  venueAddress: string;
  googleMapsUrl?: string | null;
  storyTitle?: string | null;
  storyText?: string | null;
  coverImage: string;
  galleryImages: any[];
  musicPreset: string;
  bankQrImage?: string | null;
  bankInfoText?: string | null;
  editPasscode: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  rsvps: InvitationRsvpItem[];
  _count?: { rsvps: number };
}

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<AdminInvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [templateFilter, setTemplateFilter] = useState<string>('ALL');

  // UI state
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Modals
  const [selectedForRsvp, setSelectedForRsvp] = useState<AdminInvitationItem | null>(null);
  const [selectedForEdit, setSelectedForEdit] = useState<AdminInvitationItem | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<AdminInvitationItem | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Media Picker Modal State
  const [mediaPickerConfig, setMediaPickerConfig] = useState<{
    isOpen: boolean;
    multiple: boolean;
    target: 'create-cover' | 'create-groom' | 'create-bride' | 'create-gallery' | 'edit-cover' | 'edit-groom' | 'edit-bride' | 'edit-gallery' | null;
    title: string;
  }>({
    isOpen: false,
    multiple: false,
    target: null,
    title: '',
  });

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createActiveTab, setCreateActiveTab] = useState<'form' | 'preview'>('form');
  const [isCreating, setIsCreating] = useState(false);
  const [createDraftSlug, setCreateDraftSlug] = useState('');
  const [isUploadingCreateCover, setIsUploadingCreateCover] = useState(false);
  const [isUploadingCreateGroom, setIsUploadingCreateGroom] = useState(false);
  const [isUploadingCreateBride, setIsUploadingCreateBride] = useState(false);
  const [isUploadingCreateBankQr, setIsUploadingCreateBankQr] = useState(false);
  const [isUploadingCreateGallery, setIsUploadingCreateGallery] = useState(false);
  const [createForm, setCreateForm] = useState({
    groomName: '',
    brideName: '',
    groomParents: '',
    brideParents: '',
    groomImage: '',
    brideImage: '',
    groomBio: '',
    brideBio: '',
    ceremonyDate: '',
    ceremonyTimeText: '',
    venueName: '',
    venueAddress: '',
    googleMapsUrl: '',
    storyTitle: '',
    storyText: '',
    coverImage: '',
    galleryImages: [] as Array<{ url: string; width?: number; height?: number; caption?: string }>,
    templateId: 'timeless-ivory',
    themeColor: '#8C6D46',
    musicPreset: 'romantic-piano',
    bankQrImage: '',
    bankInfoText: '',
    customSlug: '',
    editPasscode: '',
    isPublished: true,
  });

  // Edit Form State
  const [editActiveTab, setEditActiveTab] = useState<'form' | 'preview'>('form');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGroom, setIsUploadingGroom] = useState(false);
  const [isUploadingBride, setIsUploadingBride] = useState(false);
  const [isUploadingBankQr, setIsUploadingBankQr] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [editForm, setEditForm] = useState<{
    groomName: string;
    brideName: string;
    groomParents: string;
    brideParents: string;
    groomImage: string;
    brideImage: string;
    groomBio: string;
    brideBio: string;
    ceremonyDate: string;
    ceremonyTimeText: string;
    venueName: string;
    venueAddress: string;
    googleMapsUrl: string;
    storyTitle: string;
    storyText: string;
    coverImage: string;
    galleryImages: any[];
    templateId: string;
    themeColor: string;
    musicPreset: string;
    bankQrImage: string;
    bankInfoText: string;
    editPasscode: string;
    isPublished: boolean;
  }>({
    groomName: '',
    brideName: '',
    groomParents: '',
    brideParents: '',
    groomImage: '',
    brideImage: '',
    groomBio: '',
    brideBio: '',
    ceremonyDate: '',
    ceremonyTimeText: '',
    venueName: '',
    venueAddress: '',
    googleMapsUrl: '',
    storyTitle: '',
    storyText: '',
    coverImage: '',
    galleryImages: [],
    templateId: 'timeless-ivory',
    themeColor: '#8C6D46',
    musicPreset: 'romantic-piano',
    bankQrImage: '',
    bankInfoText: '',
    editPasscode: '',
    isPublished: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/invitations');
      const data = await res.json();
      if (data.success && Array.isArray(data.invitations)) {
        setInvitations(data.invitations);
      } else {
        showToast(data.error || 'Lỗi khi tải danh sách thiệp cưới');
      }
    } catch (err: any) {
      showToast('Không thể kết nối đến máy chủ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  // Filtered invitations list
  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      const matchSearch =
        inv.groomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.brideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.venueName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'PUBLISHED'
            ? inv.isPublished
            : !inv.isPublished;

      const matchTemplate =
        templateFilter === 'ALL' ? true : inv.templateId === templateFilter;

      return matchSearch && matchStatus && matchTemplate;
    });
  }, [invitations, searchTerm, statusFilter, templateFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = invitations.length;
    const published = invitations.filter((i) => i.isPublished).length;
    const totalViews = invitations.reduce((acc, i) => acc + (i.viewCount || 0), 0);
    const totalRsvps = invitations.reduce((acc, i) => acc + (i.rsvps?.length || 0), 0);
    return { total, published, totalViews, totalRsvps };
  }, [invitations]);

  // Copy Link action
  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/thiep-cuoi/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    showToast('Đã sao chép liên kết thiệp cưới!');
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Toggle reveal PIN
  const togglePinReveal = (id: string) => {
    setRevealedPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Quick toggle isPublished status
  const handleTogglePublish = async (inv: AdminInvitationItem) => {
    try {
      const nextStatus = !inv.isPublished;
      const res = await fetch(`/api/admin/invitations/${inv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setInvitations((prev) =>
          prev.map((item) =>
            item.id === inv.id ? { ...item, isPublished: nextStatus } : item
          )
        );
        showToast(
          nextStatus ? 'Đã kích hoạt hiển thị thiệp cưới!' : 'Đã chuyển thiệp cưới về bản nháp / ẩn!'
        );
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi cập nhật');
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message);
    }
  };

  // Open Edit Modal
  const openEditModal = (inv: AdminInvitationItem) => {
    setSelectedForEdit(inv);
    setEditActiveTab('form');
    setEditForm({
      groomName: inv.groomName || '',
      brideName: inv.brideName || '',
      groomParents: inv.groomParents || '',
      brideParents: inv.brideParents || '',
      groomImage: (inv as any).groomImage || '',
      brideImage: (inv as any).brideImage || '',
      groomBio: (inv as any).groomBio || '',
      brideBio: (inv as any).brideBio || '',
      ceremonyDate: inv.ceremonyDate ? new Date(inv.ceremonyDate).toISOString().slice(0, 16) : '',
      ceremonyTimeText: inv.ceremonyTimeText || '',
      venueName: inv.venueName || '',
      venueAddress: inv.venueAddress || '',
      googleMapsUrl: inv.googleMapsUrl || '',
      storyTitle: inv.storyTitle || '',
      storyText: inv.storyText || '',
      coverImage: inv.coverImage || '',
      galleryImages: Array.isArray(inv.galleryImages) ? inv.galleryImages : [],
      templateId: inv.templateId || 'timeless-ivory',
      themeColor: inv.themeColor || '#8C6D46',
      musicPreset: inv.musicPreset || 'romantic-piano',
      bankQrImage: inv.bankQrImage || '',
      bankInfoText: inv.bankInfoText || '',
      editPasscode: inv.editPasscode || '',
      isPublished: inv.isPublished,
    });
  };

  // Upload Cover Image Handler
  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedForEdit) return;

    try {
      setIsUploadingCover(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', selectedForEdit.slug);
      formData.append('invitationSlug', selectedForEdit.slug);

      const res = await fetch('/api/invitations/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const uploadedUrl = data.url || data.image?.url;
      if (data.success && uploadedUrl) {
        setEditForm((prev) => ({ ...prev, coverImage: uploadedUrl }));
        showToast('Tải ảnh bìa thành công!');
      } else {
        showToast(data.error || 'Tải ảnh bìa thất bại');
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh: ' + err.message);
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  // Upload Groom Image Handler
  const handleUploadGroom = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedForEdit) return;

    try {
      setIsUploadingGroom(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', selectedForEdit.slug);
      formData.append('invitationSlug', selectedForEdit.slug);

      const res = await fetch('/api/invitations/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const uploadedUrl = data.url || data.image?.url;
      if (data.success && uploadedUrl) {
        setEditForm((prev) => ({ ...prev, groomImage: uploadedUrl }));
        showToast('Tải ảnh Chú Rể thành công!');
      } else {
        showToast(data.error || 'Tải ảnh Chú Rể thất bại');
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh: ' + err.message);
    } finally {
      setIsUploadingGroom(false);
      e.target.value = '';
    }
  };

  // Upload Bride Image Handler
  const handleUploadBride = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedForEdit) return;

    try {
      setIsUploadingBride(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', selectedForEdit.slug);
      formData.append('invitationSlug', selectedForEdit.slug);

      const res = await fetch('/api/invitations/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const uploadedUrl = data.url || data.image?.url;
      if (data.success && uploadedUrl) {
        setEditForm((prev) => ({ ...prev, brideImage: uploadedUrl }));
        showToast('Tải ảnh Cô Dâu thành công!');
      } else {
        showToast(data.error || 'Tải ảnh Cô Dâu thất bại');
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh: ' + err.message);
    } finally {
      setIsUploadingBride(false);
      e.target.value = '';
    }
  };

  // Upload Bank QR Image Handler
  const handleUploadBankQr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedForEdit) return;

    try {
      setIsUploadingBankQr(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', selectedForEdit.slug);
      formData.append('invitationSlug', selectedForEdit.slug);

      const res = await fetch('/api/invitations/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const uploadedUrl = data.url || data.image?.url;
      if (data.success && uploadedUrl) {
        setEditForm((prev) => ({ ...prev, bankQrImage: uploadedUrl }));
        showToast('Tải mã QR ngân hàng thành công!');
      } else {
        showToast(data.error || 'Tải mã QR thất bại');
      }
    } catch (err: any) {
      showToast('Lỗi tải mã QR: ' + err.message);
    } finally {
      setIsUploadingBankQr(false);
      e.target.value = '';
    }
  };

  // Upload Gallery Images Handler (Multi-file)
  const handleUploadGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedForEdit) return;

    try {
      setIsUploadingGallery(true);
      const newImages = [...(editForm.galleryImages || [])];
      let uploadedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('slug', selectedForEdit.slug);
        formData.append('invitationSlug', selectedForEdit.slug);

        const res = await fetch('/api/invitations/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        const uploadedUrl = data.url || data.image?.url;
        if (data.success && uploadedUrl) {
          newImages.push({
            url: uploadedUrl,
            width: data.width || 1200,
            height: data.height || 800,
            caption: '',
          });
          uploadedCount++;
        }
      }

      setEditForm((prev) => ({ ...prev, galleryImages: newImages }));
      showToast(`Đã tải lên ${uploadedCount} ảnh vào album!`);
    } catch (err: any) {
      showToast('Lỗi tải ảnh album: ' + err.message);
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  // Remove Gallery Image
  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setEditForm((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Open Media Picker for Target
  const openMediaPicker = (
    target: 'create-cover' | 'create-groom' | 'create-bride' | 'create-gallery' | 'edit-cover' | 'edit-groom' | 'edit-bride' | 'edit-gallery',
    title: string,
    multiple = false
  ) => {
    setMediaPickerConfig({
      isOpen: true,
      multiple,
      target,
      title,
    });
  };

  // Handle Media Picker Selection
  const handleMediaPickerSelect = (selectedUrls: string[], selectedItems: any[]) => {
    if (!mediaPickerConfig.target || selectedUrls.length === 0) return;

    const firstUrl = selectedUrls[0];

    switch (mediaPickerConfig.target) {
      case 'create-cover':
        setCreateForm((prev) => ({ ...prev, coverImage: firstUrl }));
        showToast('Đã chọn ảnh bìa từ Kho Media!');
        break;
      case 'create-groom':
        setCreateForm((prev) => ({ ...prev, groomImage: firstUrl }));
        showToast('Đã chọn ảnh Chú Rể từ Kho Media!');
        break;
      case 'create-bride':
        setCreateForm((prev) => ({ ...prev, brideImage: firstUrl }));
        showToast('Đã chọn ảnh Cô Dâu từ Kho Media!');
        break;
      case 'create-gallery': {
        const currentUrls = new Set(createForm.galleryImages.map((img: any) => typeof img === 'string' ? img : img.url));
        const newAdditions = selectedUrls
          .filter((url) => !currentUrls.has(url))
          .map((url) => {
            const item = selectedItems.find((i) => i.url === url);
            return {
              url,
              width: item?.width || 1200,
              height: item?.height || 800,
              caption: '',
            };
          });
        setCreateForm((prev) => ({
          ...prev,
          galleryImages: [...prev.galleryImages, ...newAdditions],
        }));
        showToast(`Đã thêm ${newAdditions.length} ảnh từ Kho Media vào album!`);
        break;
      }
      case 'edit-cover':
        setEditForm((prev) => ({ ...prev, coverImage: firstUrl }));
        showToast('Đã chọn ảnh bìa từ Kho Media!');
        break;
      case 'edit-groom':
        setEditForm((prev) => ({ ...prev, groomImage: firstUrl }));
        showToast('Đã chọn ảnh Chú Rể từ Kho Media!');
        break;
      case 'edit-bride':
        setEditForm((prev) => ({ ...prev, brideImage: firstUrl }));
        showToast('Đã chọn ảnh Cô Dâu từ Kho Media!');
        break;
      case 'edit-gallery': {
        const currentUrls = new Set((editForm.galleryImages || []).map((img: any) => typeof img === 'string' ? img : img.url));
        const newAdditions = selectedUrls
          .filter((url) => !currentUrls.has(url))
          .map((url) => {
            const item = selectedItems.find((i) => i.url === url);
            return {
              url,
              width: item?.width || 1200,
              height: item?.height || 800,
              caption: '',
            };
          });
        setEditForm((prev) => ({
          ...prev,
          galleryImages: [...(prev.galleryImages || []), ...newAdditions],
        }));
        showToast(`Đã thêm ${newAdditions.length} ảnh từ Kho Media vào album!`);
        break;
      }
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    const randomDraft = `draft-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setCreateDraftSlug(randomDraft);
    setCreateActiveTab('form');
    setCreateForm({
      groomName: '',
      brideName: '',
      groomParents: '',
      brideParents: '',
      groomImage: '',
      brideImage: '',
      groomBio: '',
      brideBio: '',
      ceremonyDate: '',
      ceremonyTimeText: '',
      venueName: '',
      venueAddress: '',
      googleMapsUrl: '',
      storyTitle: '',
      storyText: '',
      coverImage: '',
      galleryImages: [],
      templateId: 'timeless-ivory',
      themeColor: '#8C6D46',
      musicPreset: 'romantic-piano',
      bankQrImage: '',
      bankInfoText: '',
      customSlug: '',
      editPasscode: randomPin,
      isPublished: true,
    });
    setIsCreateModalOpen(true);
  };

  // Create Modal Image Uploads
  const handleUploadCreateCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createDraftSlug) return;
    try {
      setIsUploadingCreateCover(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', createDraftSlug);
      formData.append('invitationSlug', createDraftSlug);
      const res = await fetch('/api/invitations/upload', { method: 'POST', body: formData });
      const data = await res.json();
      const uploadedUrl = data.url || data.image?.url;
      if (data.success && uploadedUrl) {
        setCreateForm((prev) => ({ ...prev, coverImage: uploadedUrl }));
        showToast('Tải ảnh bìa thành công!');
      } else {
        showToast(data.error || 'Tải ảnh bìa thất bại');
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh: ' + err.message);
    } finally {
      setIsUploadingCreateCover(false);
      e.target.value = '';
    }
  };

  const handleUploadCreateGroom = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createDraftSlug) return;
    try {
      setIsUploadingCreateGroom(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', createDraftSlug);
      formData.append('invitationSlug', createDraftSlug);
      const res = await fetch('/api/invitations/upload', { method: 'POST', body: formData });
      const data = await res.json();
      const uploadedUrl = data.url || data.image?.url;
      if (data.success && uploadedUrl) {
        setCreateForm((prev) => ({ ...prev, groomImage: uploadedUrl }));
        showToast('Tải ảnh Chú Rể thành công!');
      } else {
        showToast(data.error || 'Tải ảnh Chú Rể thất bại');
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh: ' + err.message);
    } finally {
      setIsUploadingCreateGroom(false);
      e.target.value = '';
    }
  };

  const handleUploadCreateBride = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createDraftSlug) return;
    try {
      setIsUploadingCreateBride(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', createDraftSlug);
      formData.append('invitationSlug', createDraftSlug);
      const res = await fetch('/api/invitations/upload', { method: 'POST', body: formData });
      const data = await res.json();
      const uploadedUrl = data.url || data.image?.url;
      if (data.success && uploadedUrl) {
        setCreateForm((prev) => ({ ...prev, brideImage: uploadedUrl }));
        showToast('Tải ảnh Cô Dâu thành công!');
      } else {
        showToast(data.error || 'Tải ảnh Cô Dâu thất bại');
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh: ' + err.message);
    } finally {
      setIsUploadingCreateBride(false);
      e.target.value = '';
    }
  };

  const handleUploadCreateBankQr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createDraftSlug) return;
    try {
      setIsUploadingCreateBankQr(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', createDraftSlug);
      formData.append('invitationSlug', createDraftSlug);
      const res = await fetch('/api/invitations/upload', { method: 'POST', body: formData });
      const data = await res.json();
      const uploadedUrl = data.url || data.image?.url;
      if (data.success && uploadedUrl) {
        setCreateForm((prev) => ({ ...prev, bankQrImage: uploadedUrl }));
        showToast('Tải mã QR ngân hàng thành công!');
      } else {
        showToast(data.error || 'Tải mã QR thất bại');
      }
    } catch (err: any) {
      showToast('Lỗi tải mã QR: ' + err.message);
    } finally {
      setIsUploadingCreateBankQr(false);
      e.target.value = '';
    }
  };

  const handleUploadCreateGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !createDraftSlug) return;
    try {
      setIsUploadingCreateGallery(true);
      const newImages = [...(createForm.galleryImages || [])];
      let count = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('slug', createDraftSlug);
        formData.append('invitationSlug', createDraftSlug);
        const res = await fetch('/api/invitations/upload', { method: 'POST', body: formData });
        const data = await res.json();
        const uploadedUrl = data.url || data.image?.url;
        if (data.success && uploadedUrl) {
          newImages.push({
            url: uploadedUrl,
            width: data.width || 1200,
            height: data.height || 800,
            caption: '',
          });
          count++;
        }
      }
      setCreateForm((prev) => ({ ...prev, galleryImages: newImages }));
      showToast(`Đã tải lên ${count} ảnh vào album!`);
    } catch (err: any) {
      showToast('Lỗi tải album: ' + err.message);
    } finally {
      setIsUploadingCreateGallery(false);
      e.target.value = '';
    }
  };

  const handleRemoveCreateGalleryImage = (indexToRemove: number) => {
    setCreateForm((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Submit Create Form
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.groomName.trim() || !createForm.brideName.trim()) {
      showToast('Vui lòng nhập tên Chú Rể và Cô Dâu');
      return;
    }
    if (!createForm.venueName.trim()) {
      showToast('Vui lòng nhập hoặc chọn nhà hàng / địa điểm tổ chức hôn lễ');
      return;
    }
    if (!createForm.ceremonyDate) {
      showToast('Vui lòng chọn ngày tổ chức hôn lễ');
      return;
    }
    if (!createForm.coverImage) {
      showToast('Vui lòng tải lên ảnh bìa thiệp cưới');
      return;
    }

    try {
      setIsCreating(true);
      const resolvedVenueAddress = createForm.venueAddress.trim() || createForm.venueName.trim();
      const finalMapUrl = createForm.googleMapsUrl?.trim() || (
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([createForm.venueName.trim(), resolvedVenueAddress].filter(Boolean).join(' ').trim())}`
      );

      const payload = {
        ...createForm,
        venueName: createForm.venueName.trim(),
        venueAddress: resolvedVenueAddress,
        googleMapsUrl: finalMapUrl,
        draftSlug: createDraftSlug,
      };

      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.invitation) {
        showToast(`Tạo thiệp cưới thành công! Link: /thiep-cuoi/${data.slug} | Mã PIN: ${data.editPasscode}`);
        setInvitations((prev) => [data.invitation, ...prev]);
        setIsCreateModalOpen(false);
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi tạo thiệp');
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Live preview data for Create Modal
  const createPreviewData = useMemo(() => {
    return {
      slug: createForm.customSlug || createDraftSlug || 'preview-wedding',
      templateId: createForm.templateId,
      themeColor: createForm.themeColor,
      groomName: createForm.groomName,
      brideName: createForm.brideName,
      groomParents: createForm.groomParents,
      brideParents: createForm.brideParents,
      groomImage: createForm.groomImage,
      brideImage: createForm.brideImage,
      groomBio: createForm.groomBio,
      brideBio: createForm.brideBio,
      ceremonyDate: createForm.ceremonyDate,
      ceremonyTimeText: createForm.ceremonyTimeText,
      venueName: createForm.venueName,
      venueAddress: createForm.venueAddress,
      googleMapsUrl:
        createForm.googleMapsUrl ||
        ((createForm.venueName || createForm.venueAddress)
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([createForm.venueName, createForm.venueAddress].filter(Boolean).join(' ').trim())}`
          : ''),
      storyTitle: createForm.storyTitle,
      storyText: createForm.storyText,
      coverImage: createForm.coverImage,
      galleryImages: createForm.galleryImages,
      musicPreset: createForm.musicPreset,
      bankQrImage: createForm.bankQrImage,
      bankInfoText: createForm.bankInfoText,
      rsvps: [],
    };
  }, [createForm, createDraftSlug]);

  // Live preview data for Edit Modal
  const editPreviewData = useMemo(() => {
    return {
      slug: selectedForEdit?.slug || 'preview-wedding',
      templateId: editForm.templateId,
      themeColor: editForm.themeColor,
      groomName: editForm.groomName,
      brideName: editForm.brideName,
      groomParents: editForm.groomParents,
      brideParents: editForm.brideParents,
      groomImage: editForm.groomImage,
      brideImage: editForm.brideImage,
      groomBio: editForm.groomBio,
      brideBio: editForm.brideBio,
      ceremonyDate: editForm.ceremonyDate,
      ceremonyTimeText: editForm.ceremonyTimeText,
      venueName: editForm.venueName,
      venueAddress: editForm.venueAddress,
      googleMapsUrl:
        editForm.googleMapsUrl ||
        ((editForm.venueName || editForm.venueAddress)
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([editForm.venueName, editForm.venueAddress].filter(Boolean).join(' ').trim())}`
          : ''),
      storyTitle: editForm.storyTitle,
      storyText: editForm.storyText,
      coverImage: editForm.coverImage,
      galleryImages: editForm.galleryImages,
      musicPreset: editForm.musicPreset,
      bankQrImage: editForm.bankQrImage,
      bankInfoText: editForm.bankInfoText,
      rsvps: selectedForEdit?.rsvps || [],
    };
  }, [editForm, selectedForEdit]);

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForEdit) return;

    try {
      setIsSavingEdit(true);
      const resolvedVenueAddress = editForm.venueAddress.trim() || editForm.venueName.trim();
      const finalMapUrl = editForm.googleMapsUrl?.trim() || (
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([editForm.venueName.trim(), resolvedVenueAddress].filter(Boolean).join(' ').trim())}`
      );
      const res = await fetch(`/api/admin/invitations/${selectedForEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          venueName: editForm.venueName.trim(),
          venueAddress: resolvedVenueAddress,
          googleMapsUrl: finalMapUrl,
        }),
      });
      const data = await res.json();
      if (data.success && data.invitation) {
        showToast('Đã lưu thay đổi thông tin thiệp cưới thành công!');
        setInvitations((prev) =>
          prev.map((item) =>
            item.id === selectedForEdit.id
              ? { ...item, ...data.invitation, rsvps: item.rsvps }
              : item
          )
        );
        setSelectedForEdit(null);
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi cập nhật');
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Invitation Action
  const handleDeleteInvitation = async () => {
    if (!selectedForDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/invitations/${selectedForDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa vĩnh viễn thiệp cưới!');
        setInvitations((prev) => prev.filter((i) => i.id !== selectedForDelete.id));
        setSelectedForDelete(null);
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi xóa thiệp');
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete Individual RSVP
  const handleDeleteRsvp = async (invitationId: string, rsvpId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phản hồi / lời chúc này khỏi thiệp?')) return;

    try {
      const res = await fetch(`/api/admin/invitations/${invitationId}/rsvps/${rsvpId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa lời chúc thành công!');
        setInvitations((prev) =>
          prev.map((inv) =>
            inv.id === invitationId
              ? { ...inv, rsvps: inv.rsvps.filter((r) => r.id !== rsvpId) }
              : inv
          )
        );
        if (selectedForRsvp && selectedForRsvp.id === invitationId) {
          setSelectedForRsvp((prev) =>
            prev ? { ...prev, rsvps: prev.rsvps.filter((r) => r.id !== rsvpId) } : null
          );
        }
      } else {
        showToast(data.error || 'Có lỗi khi xóa lời chúc');
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message);
    }
  };

  // Export CSV for RSVP list
  const handleExportCsv = (inv: AdminInvitationItem) => {
    if (!inv.rsvps || inv.rsvps.length === 0) {
      showToast('Chưa có danh sách khách mời để xuất file');
      return;
    }

    const headers = ['STT', 'Họ Tên Khách Mời', 'Tham Dự?', 'Số Lượng', 'Khách Của Ai', 'Lời Chúc', 'Thời Gian Gửi'];
    const rows = inv.rsvps.map((r, idx) => [
      idx + 1,
      `"${r.guestName.replace(/"/g, '""')}"`,
      r.attendance === 'ATTENDING' ? 'Tham dự' : 'Báo bận',
      r.guestCount,
      r.side === 'GROOM' ? 'Nhà Trai' : r.side === 'BRIDE' ? 'Nhà Gái' : 'Cả Hai',
      `"${(r.wishMessage || '').replace(/"/g, '""')}"`,
      new Date(r.createdAt).toLocaleString('vi-VN'),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DS_KhachMoi_${inv.slug}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã tải xuống file CSV danh sách khách mời!');
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-medium shadow-xl border border-stone-800 animate-slide-up flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-light text-stone-900">
              Quản Lý Thiệp Cưới Online
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-50 text-rose-700 border border-rose-200">
              Live Mod
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Theo dõi lượt xem, hỗ trợ dâu rể đổi mã PIN, kiểm duyệt lời chúc và danh sách RSVP.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchInvitations}
            className="h-10 px-3.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Làm mới danh sách"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm Mới</span>
          </button>

          <button
            onClick={openCreateModal}
            className="h-10 px-4 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Thiệp Cưới Mới</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
            Tổng Số Thiệp Đã Tạo
          </div>
          <div className="font-serif text-3xl font-normal text-stone-900 mt-1">
            {stats.total}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{stats.published}</span> đang xuất bản công khai
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
            Tổng Lượt Xem Thiệp
          </div>
          <div className="font-serif text-3xl font-normal text-stone-900 mt-1">
            {stats.totalViews.toLocaleString('vi-VN')}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Tương tác mở link từ khách mời
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
            Tổng Lượt Xác Nhận RSVP
          </div>
          <div className="font-serif text-3xl font-normal text-stone-900 mt-1">
            {stats.totalRsvps}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Khách gửi phản hồi & lời chúc
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
            Trạng Thái Dịch Vụ
          </div>
          <div className="font-serif text-lg font-medium text-emerald-700 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Hoạt Động Ổn Định</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Hỗ trợ 4 phong cách giao diện
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên cô dâu, chú rể, slug, địa điểm..."
            className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-stone-300 bg-stone-50/50 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8C6D46] focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-stone-300 bg-white text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đang hiển thị</option>
            <option value="DRAFT">Đang ẩn / Nháp</option>
          </select>

          {/* Template Filter */}
          <select
            value={templateFilter}
            onChange={(e) => setTemplateFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-stone-300 bg-white text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
          >
            <option value="ALL">Tất cả mẫu thiết kế</option>
            {Object.values(INVITATION_TEMPLATES).map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE / LIST OF INVITATIONS */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8C6D46]" />
            <span>Đang tải danh sách thiệp cưới...</span>
          </div>
        ) : filteredInvitations.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs space-y-2">
            <Heart className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="font-medium text-stone-700 text-sm">Chưa có thiệp cưới nào phù hợp</p>
            <p className="text-stone-400 max-w-sm mx-auto">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái để xem thêm kết quả.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-mono uppercase tracking-wider text-stone-500">
                  <th className="py-3.5 px-4 font-semibold">Ảnh Bìa</th>
                  <th className="py-3.5 px-4 font-semibold">Cặp Đôi & Liên Kết</th>
                  <th className="py-3.5 px-4 font-semibold">Ngày Cưới & Địa Điểm</th>
                  <th className="py-3.5 px-4 font-semibold">Mã PIN Sửa</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Tương Tác</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Hiển Thị</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredInvitations.map((inv) => {
                  const tpl = INVITATION_TEMPLATES[inv.templateId] || INVITATION_TEMPLATES['timeless-ivory'];
                  const isPinRevealed = revealedPins[inv.id] || false;
                  const attendingCount = (inv.rsvps || []).filter((r) => r.attendance === 'ATTENDING').length;
                  const totalGuests = (inv.rsvps || []).reduce(
                    (acc, r) => (r.attendance === 'ATTENDING' ? acc + (r.guestCount || 1) : acc),
                    0
                  );

                  return (
                    <tr key={inv.id} className="hover:bg-stone-50/60 transition-colors">
                      {/* Cover Thumbnail */}
                      <td className="py-3.5 px-4 align-top w-20">
                        <div className="w-16 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-2xs relative shrink-0">
                          {inv.coverImage ? (
                            <img
                              src={inv.coverImage}
                              alt=""
                              className="w-full h-full object-cover object-[50%_18%]"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Heart className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Couple & Link */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="font-serif text-sm font-medium text-stone-900 leading-snug">
                          {inv.groomName} <span className="text-[#8C6D46] italic">&</span> {inv.brideName}
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono mt-1 bg-stone-100 text-stone-600 border border-stone-200">
                          <span>{tpl.name}</span>
                        </div>

                        {/* Public Link with Copy & New Tab */}
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] font-mono text-stone-500">
                          <span className="truncate max-w-[150px]">{inv.slug}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(inv.slug)}
                            className="p-1 rounded hover:bg-stone-200 text-stone-600 transition-colors"
                            title="Sao chép link thiệp"
                          >
                            {copiedSlug === inv.slug ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <Link
                            href={`/thiep-cuoi/${inv.slug}`}
                            target="_blank"
                            className="p-1 rounded hover:bg-stone-200 text-stone-600 transition-colors"
                            title="Xem thiệp cưới công khai"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>

                      {/* Ceremony Date & Venue */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="flex items-center gap-1.5 font-medium text-stone-800">
                          <Calendar className="w-3 h-3 text-[#8C6D46] shrink-0" />
                          <span>
                            {inv.ceremonyTimeText ||
                              new Date(inv.ceremonyDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 text-stone-500 mt-1 line-clamp-2">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                          <span>{inv.venueName} — {inv.venueAddress}</span>
                        </div>
                      </td>

                      {/* Edit PIN passcode */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 font-mono text-xs">
                          <span className="font-semibold text-stone-800">
                            {isPinRevealed ? inv.editPasscode : '••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePinReveal(inv.id)}
                            className="text-stone-400 hover:text-stone-700 transition-colors"
                            title={isPinRevealed ? 'Ẩn mã PIN' : 'Hiện mã PIN khách'}
                          >
                            {isPinRevealed ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Interactive Stats */}
                      <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1 font-mono">
                          <span className="text-[11px] text-stone-600 flex items-center gap-1">
                            <Eye className="w-3 h-3 text-stone-400" />
                            <span>{inv.viewCount} xem</span>
                          </span>
                          <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                            <Users className="w-3 h-3 text-emerald-600" />
                            <span>{attendingCount} RSVP ({totalGuests} khách)</span>
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {inv.rsvps?.length || 0} lời chúc
                          </span>
                        </div>
                      </td>

                      {/* Published Toggle */}
                      <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(inv)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${inv.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200'
                            }`}
                          title={inv.isPublished ? 'Bấm để ẩn thiệp' : 'Bấm để xuất bản thiệp'}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${inv.isPublished ? 'bg-emerald-600' : 'bg-stone-400'
                              }`}
                          />
                          <span>{inv.isPublished ? 'Hiển thị' : 'Đang ẩn'}</span>
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manage RSVP */}
                          <button
                            type="button"
                            onClick={() => setSelectedForRsvp(inv)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors"
                            title="Quản lý RSVP & Lời Chúc"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Invitation */}
                          <button
                            type="button"
                            onClick={() => openEditModal(inv)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors"
                            title="Chỉnh sửa thiệp cưới"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Invitation */}
                          <button
                            type="button"
                            onClick={() => setSelectedForDelete(inv)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Xóa thiệp cưới"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* 1. RSVP & WISHES MODERATION MODAL                             */}
      {/* ============================================================= */}
      {selectedForRsvp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
              <div>
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  RSVP & Lời Chúc — {selectedForRsvp.groomName} & {selectedForRsvp.brideName}
                </h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  /thiep-cuoi/{selectedForRsvp.slug}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportCsv(selectedForRsvp)}
                  className="h-8 px-3 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Xuất file CSV danh sách khách"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedForRsvp(null)}
                  className="p-1.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick RSVP Summary Bar */}
            <div className="p-4 bg-amber-50/50 border-b border-amber-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white border border-amber-200/60">
                <div className="text-[10px] uppercase font-mono text-stone-400">Khách Tham Dự</div>
                <div className="text-base font-bold text-emerald-700 font-mono">
                  {(selectedForRsvp.rsvps || []).reduce(
                    (acc, r) => (r.attendance === 'ATTENDING' ? acc + (r.guestCount || 1) : acc),
                    0
                  )}{' '}
                  người
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white border border-amber-200/60">
                <div className="text-[10px] uppercase font-mono text-stone-400">Khách Báo Bận</div>
                <div className="text-base font-bold text-stone-600 font-mono">
                  {(selectedForRsvp.rsvps || []).filter((r) => r.attendance === 'DECLINED').length}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white border border-amber-200/60">
                <div className="text-[10px] uppercase font-mono text-stone-400">Khách Nhà Trai</div>
                <div className="text-base font-bold text-[#8C6D46] font-mono">
                  {(selectedForRsvp.rsvps || []).filter((r) => r.side === 'GROOM').length}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white border border-amber-200/60">
                <div className="text-[10px] uppercase font-mono text-stone-400">Khách Nhà Gái</div>
                <div className="text-base font-bold text-rose-600 font-mono">
                  {(selectedForRsvp.rsvps || []).filter((r) => r.side === 'BRIDE').length}
                </div>
              </div>
            </div>

            {/* RSVP List Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {(!selectedForRsvp.rsvps || selectedForRsvp.rsvps.length === 0) ? (
                <div className="text-center py-10 text-stone-400 text-xs">
                  Chưa có khách mời nào gửi xác nhận hoặc lời chúc cho thiệp cưới này.
                </div>
              ) : (
                selectedForRsvp.rsvps.map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 flex items-start justify-between gap-4 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-sm">
                          {rsvp.guestName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${rsvp.attendance === 'ATTENDING'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-700'
                            }`}
                        >
                          {rsvp.attendance === 'ATTENDING'
                            ? `Sẽ tham dự (${rsvp.guestCount} người)`
                            : 'Không thể đến'}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">
                          {rsvp.side === 'GROOM'
                            ? '• Nhà Trai'
                            : rsvp.side === 'BRIDE'
                              ? '• Nhà Gái'
                              : '• Cả Hai'}
                        </span>
                      </div>

                      {rsvp.wishMessage && (
                        <p className="text-xs text-stone-600 italic bg-white p-2.5 rounded-xl border border-stone-200/60 leading-relaxed">
                          &ldquo;{rsvp.wishMessage}&rdquo;
                        </p>
                      )}

                      <div className="text-[10px] text-stone-400 font-mono">
                        Gửi lúc: {new Date(rsvp.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRsvp(selectedForRsvp.id, rsvp.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition-colors shrink-0"
                      title="Xóa lời chúc này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedForRsvp(null)}
                className="h-9 px-4 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 2. EDIT INVITATION MODAL (2-COLUMN: FORM + LIVE PREVIEW)      */}
      {/* ============================================================= */}
      {selectedForEdit && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-[95vw] max-w-6xl h-[90vh] bg-white rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-medium text-stone-900">
                    Chỉnh Sửa Thiệp Cưới — <span className="font-mono text-sm text-[#8C6D46]">{selectedForEdit.slug}</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Xem trước trực tiếp theo thời gian thực • Live Mobile Preview
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile / Small Screen View Switcher */}
                <div className="lg:hidden flex items-center bg-stone-200/70 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setEditActiveTab('form')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${editActiveTab === 'form'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                      }`}
                  >
                    1. Thiết Lập
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditActiveTab('preview')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${editActiveTab === 'preview'
                      ? 'bg-[#8C6D46] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                      }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>2. Xem Trước Thiệp</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedForEdit(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_410px] min-h-0 overflow-hidden">
              {/* Left Column: Form Controls */}
              <form
                onSubmit={handleSaveEdit}
                className={`p-6 overflow-y-auto space-y-4 text-xs ${editActiveTab === 'preview' ? 'hidden lg:block' : 'block'
                  }`}
              >
                {/* Storage Path Indicator */}
                <div className="p-3 bg-stone-50 border border-stone-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-stone-600">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[#8C6D46] shrink-0" />
                    <span className="text-[11px]">
                      Thư mục lưu ảnh:{' '}
                      <code className="font-mono font-semibold text-stone-800 bg-stone-200/70 px-1.5 py-0.5 rounded">
                        /uploads/invitations/{selectedForEdit.slug}/
                      </code>
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-stone-500 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span>{editForm.galleryImages?.length || 0} ảnh trong album</span>
                  </div>
                </div>

                {/* Couple names */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Tên Chú Rể <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.groomName}
                      onChange={(e) => setEditForm({ ...editForm, groomName: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Tên Cô Dâu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.brideName}
                      onChange={(e) => setEditForm({ ...editForm, brideName: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                </div>

                {/* Ceremony Date & Time text */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Ngày & Giờ Tổ Chức
                    </label>
                    <input
                      type="datetime-local"
                      value={editForm.ceremonyDate}
                      onChange={(e) => setEditForm({ ...editForm, ceremonyDate: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Văn Bản Hiển Thị Giờ
                    </label>
                    <input
                      type="text"
                      value={editForm.ceremonyTimeText}
                      onChange={(e) => setEditForm({ ...editForm, ceremonyTimeText: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                </div>

                {/* Venue Autocomplete & PIN */}
                <div className="space-y-4 pt-2 border-t border-stone-100">
                  <VenueAutocompleteInput
                    venueName={editForm.venueName}
                    venueAddress={editForm.venueAddress}
                    googleMapsUrl={editForm.googleMapsUrl}
                    onChangeVenueName={(val) => setEditForm({ ...editForm, venueName: val })}
                    onChangeVenueAddress={(val) => setEditForm({ ...editForm, venueAddress: val })}
                    onChangeGoogleMapsUrl={(val) => setEditForm({ ...editForm, googleMapsUrl: val })}
                  />

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Mã PIN Chỉnh Sửa Của Khách (6 Số)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={editForm.editPasscode}
                      onChange={(e) => setEditForm({ ...editForm, editPasscode: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                </div>

                {/* Cover Image */}
                <div className="space-y-1.5 p-3 rounded-xl border border-stone-200 bg-stone-50/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <label className="block font-semibold text-stone-800 text-xs">
                        1. Ảnh Bìa Thiệp Cưới (Hero Cover)
                      </label>
                      <p className="text-[11px] text-stone-500">
                        💡 Hiển thị toàn màn hình ngay đầu thiệp khi khách mở phong bì.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="h-8 px-2.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs">
                        {isUploadingCover ? (
                          <Loader2 className="w-3 h-3 animate-spin text-[#8C6D46]" />
                        ) : (
                          <Upload className="w-3 h-3 text-stone-600" />
                        )}
                        <span>{isUploadingCover ? 'Đang tải...' : 'Tải ảnh mới'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingCover}
                          onChange={handleUploadCover}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => openMediaPicker('edit-cover', 'Chọn Ảnh Bìa Thiệp Cưới (Edit)')}
                        className="h-8 px-2.5 rounded-lg border border-[#8C6D46]/40 bg-[#8C6D46]/10 hover:bg-[#8C6D46]/20 text-[#8C6D46] font-medium text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <ImageIcon className="w-3 h-3 text-[#8C6D46]" />
                        <span>Chọn từ Kho Media</span>
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={editForm.coverImage}
                    onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                  {editForm.coverImage && (
                    <div className="w-20 h-28 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 relative shadow-2xs mt-2">
                      <img
                        src={editForm.coverImage}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Groom & Bride Portraits */}
                <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3">
                  <div>
                    <label className="block font-semibold text-stone-800 text-xs">
                      2. Ảnh Chân Dung Chú Rể & Cô Dâu (Thứ tự: Chú Rể → Cô Dâu)
                    </label>
                    <p className="text-[11px] text-stone-500">
                      💡 Hiển thị ngay sau thông tin hai họ. Tỷ lệ dọc 3:4.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Groom */}
                    <div className="p-2.5 rounded-lg border border-stone-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#8C6D46]">① Chân Dung Chú Rể</span>
                        <div className="flex items-center gap-1">
                          <label className="h-7 px-2 rounded-md border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium text-[10px] flex items-center gap-1 cursor-pointer transition-colors">
                            {isUploadingGroom ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-[#8C6D46]" />
                            ) : (
                              <Upload className="w-2.5 h-2.5 text-stone-600" />
                            )}
                            <span>{isUploadingGroom ? '...' : 'Tải'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingGroom}
                              onChange={handleUploadGroom}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => openMediaPicker('edit-groom', 'Chọn Chân Dung Chú Rể (Edit)')}
                            className="h-7 px-2 rounded-md border border-[#8C6D46]/30 bg-[#8C6D46]/10 hover:bg-[#8C6D46]/20 text-[#8C6D46] font-medium text-[10px] flex items-center gap-1 transition-colors"
                          >
                            <ImageIcon className="w-2.5 h-2.5 text-[#8C6D46]" />
                            <span>Kho Media</span>
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={editForm.groomImage}
                        onChange={(e) => setEditForm({ ...editForm, groomImage: e.target.value })}
                        className="w-full h-8 px-2.5 rounded-md border border-stone-300 text-xs"
                      />
                      {editForm.groomImage && (
                        <div className="w-14 h-18 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 relative shadow-2xs">
                          <img
                            src={editForm.groomImage}
                            alt="Groom Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="text"
                        value={editForm.groomBio}
                        onChange={(e) => setEditForm({ ...editForm, groomBio: e.target.value })}
                        className="w-full h-8 px-2.5 rounded-md border border-stone-300 text-xs"
                      />
                    </div>

                    {/* Bride */}
                    <div className="p-2.5 rounded-lg border border-stone-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#8C6D46]">② Chân Dung Cô Dâu</span>
                        <div className="flex items-center gap-1">
                          <label className="h-7 px-2 rounded-md border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium text-[10px] flex items-center gap-1 cursor-pointer transition-colors">
                            {isUploadingBride ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-[#8C6D46]" />
                            ) : (
                              <Upload className="w-2.5 h-2.5 text-stone-600" />
                            )}
                            <span>{isUploadingBride ? '...' : 'Tải'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingBride}
                              onChange={handleUploadBride}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => openMediaPicker('edit-bride', 'Chọn Chân Dung Cô Dâu (Edit)')}
                            className="h-7 px-2 rounded-md border border-[#8C6D46]/30 bg-[#8C6D46]/10 hover:bg-[#8C6D46]/20 text-[#8C6D46] font-medium text-[10px] flex items-center gap-1 transition-colors"
                          >
                            <ImageIcon className="w-2.5 h-2.5 text-[#8C6D46]" />
                            <span>Kho Media</span>
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={editForm.brideImage}
                        onChange={(e) => setEditForm({ ...editForm, brideImage: e.target.value })}
                        className="w-full h-8 px-2.5 rounded-md border border-stone-300 text-xs"
                      />
                      {editForm.brideImage && (
                        <div className="w-14 h-18 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 relative shadow-2xs">
                          <img
                            src={editForm.brideImage}
                            alt="Bride Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="text"
                        value={editForm.brideBio}
                        onChange={(e) => setEditForm({ ...editForm, brideBio: e.target.value })}
                        className="w-full h-8 px-2.5 rounded-md border border-stone-300 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank QR & Gift Info */}
                <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
                  <label className="block font-semibold text-stone-800 text-xs">
                    Mừng Cưới & Tài Khoản Ngân Hàng (Tùy chọn)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editForm.bankQrImage}
                      onChange={(e) => setEditForm({ ...editForm, bankQrImage: e.target.value })}
                      className="flex-1 h-8 px-2.5 rounded-md border border-stone-300 text-xs"
                    />
                    <label className="h-8 px-2.5 rounded-md border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-medium text-[11px] flex items-center gap-1 cursor-pointer shrink-0 transition-colors shadow-2xs">
                      {isUploadingBankQr ? (
                        <Loader2 className="w-3 h-3 animate-spin text-[#8C6D46]" />
                      ) : (
                        <Upload className="w-3 h-3 text-stone-600" />
                      )}
                      <span>{isUploadingBankQr ? '...' : 'Tải QR'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingBankQr}
                        onChange={handleUploadBankQr}
                      />
                    </label>
                  </div>
                  {editForm.bankQrImage && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-stone-200 bg-white relative shadow-2xs">
                      <img
                        src={editForm.bankQrImage}
                        alt="Bank QR Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    value={editForm.bankInfoText}
                    onChange={(e) => setEditForm({ ...editForm, bankInfoText: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-md border border-stone-300 text-xs"
                  />
                </div>

                {/* Visual Gallery Image Manager */}
                <div className="space-y-2 pt-1 border-t border-stone-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block font-medium text-stone-700">
                        Album Ảnh Cưới & Khoảnh Khắc (Gallery)
                      </label>
                      <p className="text-[11px] text-stone-400">
                        Khách mời có thể vuốt xem và phóng to trọn màn hình
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="h-8 px-2.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors">
                        {isUploadingGallery ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C6D46]" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-stone-600" />
                        )}
                        <span>{isUploadingGallery ? 'Đang tải...' : 'Tải nhiều ảnh mới'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={isUploadingGallery}
                          onChange={handleUploadGallery}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => openMediaPicker('edit-gallery', 'Chọn Ảnh Cho Album (Edit)', true)}
                        className="h-8 px-2.5 rounded-xl border border-[#8C6D46]/40 bg-[#8C6D46]/10 hover:bg-[#8C6D46]/20 text-[#8C6D46] font-medium text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#8C6D46]" />
                        <span>Chọn từ Kho Media</span>
                      </button>
                    </div>
                  </div>

                  {(!editForm.galleryImages || editForm.galleryImages.length === 0) ? (
                    <div className="p-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 text-center text-[11px] text-stone-400">
                      Chưa có ảnh nào trong album. Bấm &ldquo;Thêm ảnh album&rdquo; để tải lên.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                      {editForm.galleryImages.map((img: any, idx: number) => {
                        const imgUrl = typeof img === 'string' ? img : img.url;
                        return (
                          <div
                            key={idx}
                            className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs"
                          >
                            <img
                              src={imgUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-all"
                              title="Xóa ảnh này"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Template & Theme Color */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Mẫu Thiết Kế (Template)
                    </label>
                    <select
                      value={editForm.templateId}
                      onChange={(e) => setEditForm({ ...editForm, templateId: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    >
                      {Object.values(INVITATION_TEMPLATES).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Nhạc Nền Hôn Lễ
                    </label>
                    <select
                      value={editForm.musicPreset}
                      onChange={(e) => setEditForm({ ...editForm, musicPreset: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    >
                      <option value="romantic-piano">Romantic Piano</option>
                      <option value="acoustic-love">Acoustic Love</option>
                      <option value="cinematic-orchestral">Cinematic Orchestral</option>
                      <option value="gentle-strings">Gentle Strings</option>
                    </select>
                  </div>
                </div>

                {/* Story */}
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Tiêu Đề & Lời Kể Câu Chuyện Tình Yêu
                  </label>
                  <input
                    type="text"
                    value={editForm.storyTitle}
                    onChange={(e) => setEditForm({ ...editForm, storyTitle: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 mb-2 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                  <textarea
                    rows={3}
                    value={editForm.storyText}
                    onChange={(e) => setEditForm({ ...editForm, storyText: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>

                {/* Status Switch */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="modalIsPublished"
                    checked={editForm.isPublished}
                    onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                    className="w-4 h-4 text-[#8C6D46] rounded focus:ring-[#8C6D46]"
                  />
                  <label htmlFor="modalIsPublished" className="font-medium text-stone-800 cursor-pointer">
                    Xuất bản công khai thiệp cưới (Cho phép khách truy cập)
                  </label>
                </div>

                <div className="pt-4 border-t border-stone-200 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedForEdit(null)}
                    className="h-10 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="h-10 px-5 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    {isSavingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </form>

              {/* Right Column: Live Mobile Preview Pane */}
              <div
                className={`bg-[#1A1714] border-t lg:border-t-0 lg:border-l border-[#E5DFD5]/20 flex flex-col items-center justify-center p-4 overflow-hidden ${editActiveTab === 'form' ? 'hidden lg:flex' : 'flex'
                  }`}
              >
                <div className="text-[10px] tracking-[0.2em] uppercase text-[#C5A059] mb-2.5 font-mono flex items-center gap-1.5 shrink-0">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>LIVE MOBILE PREVIEW • CẬP NHẬT TỨC THÌ</span>
                </div>

                {/* Smartphone Device Frame */}
                <div className="w-[355px] h-full max-h-[710px] rounded-[36px] border-[6px] border-[#2E2924] bg-[#FAF8F5] overflow-y-auto shadow-2xl relative no-scrollbar">
                  <WeddingInvitationView
                    data={editPreviewData as any}
                    isPreview={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 2.5 CREATE INVITATION MODAL (2-COLUMN: FORM + LIVE PREVIEW)  */}
      {/* ============================================================= */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-[95vw] max-w-6xl h-[90vh] bg-white rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-medium text-stone-900">
                    Tạo Thiệp Cưới Mới (Admin Studio)
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Khởi tạo thiệp trực tiếp • Tải ảnh trực tiếp vào /uploads/invitations/[slug]/
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile / Small Screen View Switcher */}
                <div className="lg:hidden flex items-center bg-stone-200/70 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setCreateActiveTab('form')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${createActiveTab === 'form'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                      }`}
                  >
                    1. Thiết Lập
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateActiveTab('preview')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${createActiveTab === 'preview'
                      ? 'bg-[#8C6D46] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                      }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>2. Xem Trước Thiệp</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_410px] min-h-0 overflow-hidden">
              {/* Left Column: Form Controls */}
              <form
                onSubmit={handleSaveCreate}
                className={`p-6 overflow-y-auto space-y-4 text-xs ${createActiveTab === 'preview' ? 'hidden lg:block' : 'block'
                  }`}
              >
                {/* Draft Directory Indicator */}
                <div className="p-3 bg-stone-50 border border-stone-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-stone-600">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[#8C6D46] shrink-0" />
                    <span className="text-[11px]">
                      Thư mục tải ảnh dự thảo:{' '}
                      <code className="font-mono font-semibold text-stone-800 bg-stone-200/70 px-1.5 py-0.5 rounded">
                        /uploads/invitations/{createDraftSlug}/
                      </code>
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-stone-500 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span>{createForm.galleryImages.length} ảnh album</span>
                  </div>
                </div>

                {/* Template & Palette Section */}
                <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-3">
                  <div className="font-semibold text-stone-800 text-xs">
                    Phong Cách & Màu Sắc Điểm Nhấn
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'timeless-ivory', name: 'Timeless Ivory', desc: 'Cổ Điển Sang Trọng' },
                      { id: 'cinematic-noir', name: 'Cinematic Noir', desc: 'Điện Ảnh Tinh Tế' },
                      { id: 'botanical-silk', name: 'Botanical Silk', desc: 'Thơ Mộng Tươi Sáng' },
                      { id: 'minimalist-story', name: 'Minimalist Story', desc: 'Hiện Đại Tối Giản' },
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setCreateForm({ ...createForm, templateId: tpl.id })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${createForm.templateId === tpl.id
                          ? 'border-[#8C6D46] bg-white ring-2 ring-[#8C6D46]/20 shadow-xs'
                          : 'border-stone-200 bg-white/70 hover:bg-white'
                          }`}
                      >
                        <div className="font-semibold text-stone-900 text-[11px]">{tpl.name}</div>
                        <div className="text-[10px] text-stone-500">{tpl.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="text-[11px] font-medium text-stone-600">Màu nhấn:</span>
                    {[
                      { hex: '#8C6D46', name: 'Vàng Đồng Hoàng Gia' },
                      { hex: '#85292F', name: 'Đỏ Rượu Vang' },
                      { hex: '#4A6B53', name: 'Xanh Sage Tự Nhiên' },
                      { hex: '#3D5A80', name: 'Xanh Navy Hiện Đại' },
                    ].map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setCreateForm({ ...createForm, themeColor: color.hex })}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] transition-all ${createForm.themeColor === color.hex
                          ? 'border-stone-800 bg-white ring-2 ring-stone-400 font-medium'
                          : 'border-stone-200 bg-white/60 hover:bg-white text-stone-600'
                          }`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color.hex }} />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Couple names */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Tên Chú Rể <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.groomName}
                      onChange={(e) => setCreateForm({ ...createForm, groomName: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Tên Cô Dâu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.brideName}
                      onChange={(e) => setCreateForm({ ...createForm, brideName: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                </div>

                {/* Parents information */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Thân Sinh Nhà Trai
                    </label>
                    <input
                      type="text"
                      value={createForm.groomParents}
                      onChange={(e) => setCreateForm({ ...createForm, groomParents: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Thân Sinh Nhà Gái
                    </label>
                    <input
                      type="text"
                      value={createForm.brideParents}
                      onChange={(e) => setCreateForm({ ...createForm, brideParents: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                </div>

                {/* Ceremony Date & Time text */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Ngày & Giờ Tổ Chức <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={createForm.ceremonyDate}
                      onChange={(e) => setCreateForm({ ...createForm, ceremonyDate: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Văn Bản Hiển Thị Giờ (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={createForm.ceremonyTimeText}
                      onChange={(e) => setCreateForm({ ...createForm, ceremonyTimeText: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                </div>

                {/* Venue Autocomplete & PIN */}
                <div className="space-y-4 pt-2 border-t border-stone-100">
                  <VenueAutocompleteInput
                    venueName={createForm.venueName}
                    venueAddress={createForm.venueAddress}
                    googleMapsUrl={createForm.googleMapsUrl}
                    onChangeVenueName={(val) => setCreateForm({ ...createForm, venueName: val })}
                    onChangeVenueAddress={(val) => setCreateForm({ ...createForm, venueAddress: val })}
                    onChangeGoogleMapsUrl={(val) => setCreateForm({ ...createForm, googleMapsUrl: val })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Mã PIN Chỉnh Sửa (6 Số) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={createForm.editPasscode}
                          onChange={(e) => setCreateForm({ ...createForm, editPasscode: e.target.value.replace(/\D/g, '') })}
                          className="flex-1 h-10 px-3 rounded-xl border border-stone-300 font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                        />
                        <button
                          type="button"
                          onClick={() => setCreateForm({ ...createForm, editPasscode: Math.floor(100000 + Math.random() * 900000).toString() })}
                          className="h-10 px-3 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium"
                        >
                          Đổi mã
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Tùy Chỉnh Slug Đường Dẫn (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={createForm.customSlug}
                        onChange={(e) => setCreateForm({ ...createForm, customSlug: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-stone-300 font-mono focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                <div className="space-y-1.5 p-3 rounded-xl border border-stone-200 bg-stone-50/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <label className="block font-semibold text-stone-800 text-xs">
                        1. Ảnh Bìa Thiệp Cưới (Hero Cover) <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-stone-500">
                        💡 Hiển thị toàn màn hình ngay đầu thiệp khi khách mở phong bì.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="h-8 px-2.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs">
                        {isUploadingCreateCover ? (
                          <Loader2 className="w-3 h-3 animate-spin text-[#8C6D46]" />
                        ) : (
                          <Upload className="w-3 h-3 text-stone-600" />
                        )}
                        <span>{isUploadingCreateCover ? 'Đang tải...' : 'Tải ảnh mới'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingCreateCover}
                          onChange={handleUploadCreateCover}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => openMediaPicker('create-cover', 'Chọn Ảnh Bìa Thiệp Cưới (Tạo Mới)')}
                        className="h-8 px-2.5 rounded-lg border border-[#8C6D46]/40 bg-[#8C6D46]/10 hover:bg-[#8C6D46]/20 text-[#8C6D46] font-medium text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <ImageIcon className="w-3 h-3 text-[#8C6D46]" />
                        <span>Chọn từ Kho Media</span>
                      </button>
                    </div>
                  </div>
                  {createForm.coverImage && (
                    <div className="w-24 h-32 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 relative shadow-2xs mt-2">
                      <img
                        src={createForm.coverImage}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Groom & Bride Portraits */}
                <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3">
                  <div>
                    <label className="block font-semibold text-stone-800 text-xs">
                      2. Ảnh Chân Dung Chú Rể & Cô Dâu (Thứ tự: Chú Rể → Cô Dâu)
                    </label>
                    <p className="text-[11px] text-stone-500">
                      💡 Hiển thị ngay sau thông tin hai họ. Tỷ lệ dọc 3:4.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Groom */}
                    <div className="p-2.5 rounded-lg border border-stone-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#8C6D46]">① Chân Dung Chú Rể</span>
                        <div className="flex items-center gap-1">
                          <label className="h-7 px-2 rounded-md border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium text-[10px] flex items-center gap-1 cursor-pointer transition-colors">
                            {isUploadingCreateGroom ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-[#8C6D46]" />
                            ) : (
                              <Upload className="w-2.5 h-2.5 text-stone-600" />
                            )}
                            <span>{isUploadingCreateGroom ? '...' : 'Tải'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingCreateGroom}
                              onChange={handleUploadCreateGroom}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => openMediaPicker('create-groom', 'Chọn Chân Dung Chú Rể (Tạo Mới)')}
                            className="h-7 px-2 rounded-md border border-[#8C6D46]/30 bg-[#8C6D46]/10 hover:bg-[#8C6D46]/20 text-[#8C6D46] font-medium text-[10px] flex items-center gap-1 transition-colors"
                          >
                            <ImageIcon className="w-2.5 h-2.5 text-[#8C6D46]" />
                            <span>Kho Media</span>
                          </button>
                        </div>
                      </div>
                      {createForm.groomImage && (
                        <div className="w-16 h-20 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 relative shadow-2xs">
                          <img
                            src={createForm.groomImage}
                            alt="Groom Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-[10px] text-stone-500 mb-0.5">Lời tự sự Chú Rể</label>
                        <input
                          type="text"
                          value={createForm.groomBio}
                          onChange={(e) => setCreateForm({ ...createForm, groomBio: e.target.value })}
                          className="w-full h-8 px-2.5 rounded-md border border-stone-300 text-xs"
                        />
                      </div>
                    </div>

                    {/* Bride */}
                    <div className="p-2.5 rounded-lg border border-stone-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#8C6D46]">② Chân Dung Cô Dâu</span>
                        <div className="flex items-center gap-1">
                          <label className="h-7 px-2 rounded-md border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium text-[10px] flex items-center gap-1 cursor-pointer transition-colors">
                            {isUploadingCreateBride ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-[#8C6D46]" />
                            ) : (
                              <Upload className="w-2.5 h-2.5 text-stone-600" />
                            )}
                            <span>{isUploadingCreateBride ? '...' : 'Tải'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingCreateBride}
                              onChange={handleUploadCreateBride}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => openMediaPicker('create-bride', 'Chọn Chân Dung Cô Dâu (Tạo Mới)')}
                            className="h-7 px-2 rounded-md border border-[#8C6D46]/30 bg-[#8C6D46]/10 hover:bg-[#8C6D46]/20 text-[#8C6D46] font-medium text-[10px] flex items-center gap-1 transition-colors"
                          >
                            <ImageIcon className="w-2.5 h-2.5 text-[#8C6D46]" />
                            <span>Kho Media</span>
                          </button>
                        </div>
                      </div>
                      {createForm.brideImage && (
                        <div className="w-16 h-20 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 relative shadow-2xs">
                          <img
                            src={createForm.brideImage}
                            alt="Bride Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-[10px] text-stone-500 mb-0.5">Lời tự sự Cô Dâu</label>
                        <input
                          type="text"
                          value={createForm.brideBio}
                          onChange={(e) => setCreateForm({ ...createForm, brideBio: e.target.value })}
                          className="w-full h-8 px-2.5 rounded-md border border-stone-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Gallery Image Manager */}
                <div className="space-y-2 pt-1 border-t border-stone-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block font-medium text-stone-700">
                        3. Album Ảnh Cưới & Khoảnh Khắc (Gallery)
                      </label>
                      <p className="text-[11px] text-stone-400">
                        Khách mời có thể vuốt xem và phóng to trọn màn hình
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="h-8 px-2.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors">
                        {isUploadingCreateGallery ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C6D46]" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-stone-600" />
                        )}
                        <span>{isUploadingCreateGallery ? 'Đang tải...' : 'Tải nhiều ảnh mới'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={isUploadingCreateGallery}
                          onChange={handleUploadCreateGallery}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => openMediaPicker('create-gallery', 'Chọn Ảnh Cho Album (Tạo Mới)', true)}
                        className="h-8 px-2.5 rounded-xl border border-[#8C6D46]/40 bg-[#8C6D46]/10 hover:bg-[#8C6D46]/20 text-[#8C6D46] font-medium text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#8C6D46]" />
                        <span>Chọn từ Kho Media</span>
                      </button>
                    </div>
                  </div>

                  {createForm.galleryImages.length === 0 ? (
                    <div className="p-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 text-center text-[11px] text-stone-400">
                      Chưa có ảnh nào trong album. Bấm &ldquo;Thêm ảnh album&rdquo; để tải lên.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                      {createForm.galleryImages.map((img: any, idx: number) => {
                        const imgUrl = typeof img === 'string' ? img : img.url;
                        return (
                          <div
                            key={idx}
                            className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs"
                          >
                            <img
                              src={imgUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveCreateGalleryImage(idx)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-all"
                              title="Xóa ảnh này"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bank QR & Gift Info */}
                <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-semibold text-stone-800 text-xs">
                        4. Mừng Cưới & Tài Khoản Ngân Hàng (Tùy chọn)
                      </label>
                    </div>
                    <label className="h-7 px-2.5 rounded-md border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-medium text-[11px] flex items-center gap-1 cursor-pointer shrink-0 transition-colors shadow-2xs">
                      {isUploadingCreateBankQr ? (
                        <Loader2 className="w-3 h-3 animate-spin text-[#8C6D46]" />
                      ) : (
                        <Upload className="w-3 h-3 text-stone-600" />
                      )}
                      <span>{isUploadingCreateBankQr ? '...' : 'Tải mã QR'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingCreateBankQr}
                        onChange={handleUploadCreateBankQr}
                      />
                    </label>
                  </div>
                  {createForm.bankQrImage && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-stone-200 bg-white relative shadow-2xs">
                      <img
                        src={createForm.bankQrImage}
                        alt="Bank QR Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] text-stone-500 mb-0.5">Thông tin tài khoản & Lời nhắn</label>
                    <input
                      type="text"
                      value={createForm.bankInfoText}
                      onChange={(e) => setCreateForm({ ...createForm, bankInfoText: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-md border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                {/* Music & Story */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Nhạc Nền Hôn Lễ
                    </label>
                    <select
                      value={createForm.musicPreset}
                      onChange={(e) => setCreateForm({ ...createForm, musicPreset: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    >
                      <option value="romantic-piano">Romantic Piano</option>
                      <option value="acoustic-love">Acoustic Love</option>
                      <option value="cinematic-orchestral">Cinematic Orchestral</option>
                      <option value="gentle-strings">Gentle Strings</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Tiêu Đề Câu Chuyện Tình Yêu
                    </label>
                    <input
                      type="text"
                      value={createForm.storyTitle}
                      onChange={(e) => setCreateForm({ ...createForm, storyTitle: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Lời Kể Câu Chuyện Tình Yêu (Tùy chọn)
                  </label>
                  <textarea
                    rows={3}
                    value={createForm.storyText}
                    onChange={(e) => setCreateForm({ ...createForm, storyText: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>

                {/* Status Switch */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="createModalIsPublished"
                    checked={createForm.isPublished}
                    onChange={(e) => setCreateForm({ ...createForm, isPublished: e.target.checked })}
                    className="w-4 h-4 text-[#8C6D46] rounded focus:ring-[#8C6D46]"
                  />
                  <label htmlFor="createModalIsPublished" className="font-medium text-stone-800 cursor-pointer">
                    Xuất bản công khai thiệp cưới ngay sau khi tạo
                  </label>
                </div>

                <div className="pt-4 border-t border-stone-200 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="h-10 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="h-10 px-5 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tạo thiệp...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Tạo Thiệp Cưới</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Right Column: Live Mobile Preview Pane */}
              <div
                className={`bg-[#1A1714] border-t lg:border-t-0 lg:border-l border-[#E5DFD5]/20 flex flex-col items-center justify-center p-4 overflow-hidden ${createActiveTab === 'form' ? 'hidden lg:flex' : 'flex'
                  }`}
              >
                <div className="text-[10px] tracking-[0.2em] uppercase text-[#C5A059] mb-2.5 font-mono flex items-center gap-1.5 shrink-0">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>LIVE MOBILE PREVIEW • CẬP NHẬT TỨC THÌ</span>
                </div>

                {/* Smartphone Device Frame */}
                <div className="w-[355px] h-full max-h-[710px] rounded-[36px] border-[6px] border-[#2E2924] bg-[#FAF8F5] overflow-y-auto shadow-2xl relative no-scrollbar">
                  <WeddingInvitationView
                    data={createPreviewData as any}
                    isPreview={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 3. DELETE CONFIRMATION MODAL                                  */}
      {/* ============================================================= */}
      {selectedForDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Xác Nhận Xóa Thiệp Cưới?
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Bạn sắp xóa vĩnh viễn thiệp của cặp đôi{' '}
                <strong>
                  {selectedForDelete.groomName} & {selectedForDelete.brideName}
                </strong>{' '}
                (đường dẫn <code>/thiep-cuoi/{selectedForDelete.slug}</code>). Toàn bộ danh sách RSVP và lời chúc sẽ bị xóa theo. Hành động này không thể hoàn tác!
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setSelectedForDelete(null)}
                className="h-10 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteInvitation}
                disabled={isDeleting}
                className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Đang xóa...' : 'Đồng Ý Xóa Vĩnh Viễn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 4. ADMIN MEDIA PICKER MODAL (OVERLAY z-[80])                 */}
      {/* ============================================================= */}
      <AdminMediaPickerModal
        isOpen={mediaPickerConfig.isOpen}
        title={mediaPickerConfig.title}
        multiple={mediaPickerConfig.multiple}
        onClose={() => setMediaPickerConfig((prev) => ({ ...prev, isOpen: false }))}
        onSelect={handleMediaPickerSelect}
      />
    </div>
  );
}
