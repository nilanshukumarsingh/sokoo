/**
 * Vendor Product Form Page
 * Dedicated page for adding/editing products (no modal)
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productsAPI } from '../utils/api';
import { Upload, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

const VendorProductForm = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const { isVendor, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(isEditMode);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrl: '',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    // Prompt before leaving if unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    useEffect(() => {
        if (!isAuthenticated || !isVendor) {
            navigate('/');
            return;
        }

        if (isEditMode) {
            fetchProduct();
        }
    }, [isAuthenticated, isVendor, id]);

    const fetchProduct = async () => {
        try {
            const response = await productsAPI.getById(id);
            const product = response.data.data;

            const existingImage = product.images?.[0] || '';
            const isExternal = existingImage.startsWith('http');

            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price,
                stock: product.stock,
                category: product.category || '',
                imageUrl: isExternal ? existingImage : '',
            });

            if (product.images?.[0]) {
                setImagePreview(getImageUrl(product));
            }
            // Reset dirty state after data load
            setIsDirty(false);
        } catch (err) {
            showToast('Failed to load product', 'error');
            navigate('/vendor/products');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (product) => {
        if (!product?.images?.[0]) return null;
        return product.images[0].startsWith('http')
            ? product.images[0]
            : `http://localhost:5000${product.images[0]}`;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setFormData(prev => ({ ...prev, imageUrl: '' }));
            setIsDirty(true);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setFormLoading(true);

        try {
            if (imageFile) {
                const formDataObj = new FormData();
                formDataObj.append('name', formData.name);
                formDataObj.append('description', formData.description);
                formDataObj.append('price', formData.price);
                formDataObj.append('stock', formData.stock);
                formDataObj.append('category', formData.category);
                formDataObj.append('image', imageFile);

                if (isEditMode) {
                    await productsAPI.updateWithImage(id, formDataObj);
                } else {
                    await productsAPI.createWithImage(formDataObj);
                }
            } else {
                const data = {
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    category: formData.category,
                    images: formData.imageUrl ? [formData.imageUrl] : [],
                };

                if (isEditMode) {
                    await productsAPI.update(id, data);
                } else {
                    await productsAPI.create(data);
                }
            }

            showToast(isEditMode ? 'Product updated successfully' : 'Product created successfully');
            navigate('/vendor/products');
        } catch (err) {
            setFormError(err.response?.data?.error || 'Failed to save product');
        } finally {
            setFormLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.81rem',
        fontSize: '0.855rem',
        border: '1px solid var(--border)',
        background: '#1a1a1a',
        color: '#ffffff',
        outline: 'none',
    };

    const selectStyle = {
        ...inputStyle,
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.9rem center',
        paddingRight: '2.25rem',
        cursor: 'pointer',
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'var(--bg)',
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    border: '2px solid var(--border)',
                    borderTopColor: 'var(--fg)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div style={{
                flex: 1,
                padding: 'var(--space-lg)',
                paddingTop: '0',
            }}>
                <div style={{ maxWidth: '540px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '1.8rem' }}>
                        <button 
                            onClick={() => {
                                if (!isDirty || window.confirm('Discard unsaved changes?')) {
                                    navigate('/vendor/products');
                                }
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--muted)',
                                fontSize: '0.765rem',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.36rem',
                                marginBottom: '0.9rem',
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            <ArrowLeft size={14} strokeWidth={2} />
                            Back to Products
                        </button>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.8rem, 3.6vw, 2.7rem)',
                            fontWeight: 700,
                            letterSpacing: '-0.04em',
                        }}>
                            {isEditMode ? 'Edit Product' : 'Add Product'}
                        </h1>
                    </div>

                    {/* Form Error */}
                    {formError && (
                        <div style={{
                            padding: '0.675rem',
                            marginBottom: '0.9rem',
                            background: 'rgba(220, 38, 38, 0.1)',
                            color: '#dc2626',
                            fontSize: '0.81rem',
                        }}>
                            {formError}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleFormSubmit} style={{
                        background: 'var(--bg-alt)',
                        padding: '1.8rem',
                        border: '1px solid var(--border)',
                    }}>
                        <div style={{ marginBottom: '0.9rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.765rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, name: e.target.value }));
                                    setIsDirty(true);
                                }}
                                style={inputStyle}
                                required
                                placeholder="Product name"
                            />
                        </div>

                        <div style={{ marginBottom: '0.9rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.765rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, description: e.target.value }));
                                    setIsDirty(true);
                                }}
                                style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                                placeholder="Product description"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.765rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Price *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, price: e.target.value }));
                                        setIsDirty(true);
                                    }}
                                    style={inputStyle}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.765rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Stock *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, stock: e.target.value }));
                                        setIsDirty(true);
                                    }}
                                    style={inputStyle}
                                    required
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '0.9rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.765rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, category: e.target.value }));
                                    setIsDirty(true);
                                }}
                                style={selectStyle}
                            >
                                <option value="" style={{ background: '#1a1a1a', color: '#fff' }}>Select category</option>
                                <option value="Electronics" style={{ background: '#1a1a1a', color: '#fff' }}>Electronics</option>
                                <option value="Fashion" style={{ background: '#1a1a1a', color: '#fff' }}>Fashion</option>
                                <option value="Home" style={{ background: '#1a1a1a', color: '#fff' }}>Home</option>
                                <option value="Sports" style={{ background: '#1a1a1a', color: '#fff' }}>Sports</option>
                                <option value="Books" style={{ background: '#1a1a1a', color: '#fff' }}>Books</option>
                                <option value="Beauty" style={{ background: '#1a1a1a', color: '#fff' }}>Beauty</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.35rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.765rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Product Image
                            </label>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div style={{ marginBottom: '0.9rem' }}>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ width: '90px', height: '90px', objectFit: 'cover', border: '1px solid var(--border)' }}
                                    />
                                </div>
                            )}

                            {/* Custom File Upload UI */}
                            <label style={{
                                ...inputStyle,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.45rem',
                                background: 'var(--bg)',
                                border: '1px dashed var(--border)',
                                color: 'var(--muted)',
                                transition: 'all 0.2s'
                            }}>
                                <Upload size={20} strokeWidth={1.5} />
                                <span style={{ fontSize: '0.81rem' }}>
                                    {imageFile ? imageFile.name : "Choose an image file..."}
                                </span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    onClick={(e) => e.target.value = null} // Allow selecting same file again
                                />
                            </label>
                            <p style={{ fontSize: '0.675rem', color: '#666', marginBottom: '0.9rem', marginTop: '0.45rem', textAlign: 'center' }}>
                                Upload an image (JPG, PNG, WebP - max 5MB)
                            </p>

                            {/* OR divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '0.9rem' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                                <span style={{ fontSize: '0.675rem', color: '#666' }}>OR</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                            </div>

                            {/* URL Input */}
                            <input
                                type="url"
                                value={formData.imageUrl}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
                                    if (e.target.value) {
                                        setImageFile(null);
                                        setImagePreview(e.target.value);
                                    }
                                    setIsDirty(true);
                                }}
                                style={inputStyle}
                                placeholder="https://example.com/image.jpg"
                                disabled={!!imageFile}
                                onClick={(e) => {
                                    // If switching to URL and file exists, confirm
                                    if (imageFile) {
                                       if(!window.confirm('Switching to URL will remove the uploaded file. Continue?')) {
                                           e.preventDefault();
                                       }
                                    }
                                }}
                            />
                            <p style={{ fontSize: '0.675rem', color: '#666', marginTop: '0.45rem' }}>
                                Or paste a direct image URL
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.9rem' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isDirty || window.confirm('Discard unsaved changes?')) {
                                        navigate('/vendor/products');
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    padding: '0.81rem',
                                    background: 'transparent',
                                    color: 'var(--fg)',
                                    border: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    fontSize: '0.81rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={formLoading}
                                style={{
                                    flex: 1,
                                    padding: '0.81rem',
                                    background: 'var(--fg)',
                                    color: 'var(--bg)',
                                    border: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.81rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    cursor: formLoading ? 'not-allowed' : 'pointer',
                                    opacity: formLoading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.45rem',
                                }}
                            >
                                {formLoading && (
                                    <div style={{
                                        width: '14px',
                                        height: '14px',
                                        border: '2px solid var(--bg)',
                                        borderTopColor: 'transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }} />
                                )}
                                {formLoading ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VendorProductForm;
