import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../utils/api";
import Footer from "../../components/Footer";
import { useToast } from "../../context/ToastContext";

const ProfileSettings = () => {
    const { user, checkAuth } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.updateDetails(formData);
            await checkAuth(); // Refresh user data in context
            addToast("Profile updated successfully", "success");
        } catch (error) {
            console.error("Failed to update profile", error);
            addToast(error.response?.data?.error || "Failed to update profile", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
        }}>
            <div style={{
                flex: 1,
                padding: "var(--space-lg)",
                paddingTop: "120px",
            }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div style={{ marginBottom: "3rem" }}>
                        <h1 style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "clamp(2rem, 5vw, 3rem)",
                            fontWeight: 700,
                            letterSpacing: "-0.04em",
                            color: "var(--fg)",
                            marginBottom: "0.5rem",
                        }}>
                            Account Settings
                        </h1>
                        <p style={{ color: "var(--muted)" }}>
                            Manage your profile details and preferences
                        </p>
                    </div>

                    <div style={{
                        background: "var(--bg-alt)",
                        padding: "2rem",
                        border: "1px solid var(--border)",
                    }}>
                        <h2 style={{
                            fontSize: "1.25rem",
                            fontWeight: 600,
                            marginBottom: "1.5rem",
                            fontFamily: "var(--font-display)",
                        }}>
                            Profile Information
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 500,
                                    color: "var(--muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                }}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem 1rem",
                                        background: "var(--bg)",
                                        border: "1px solid var(--border)",
                                        color: "var(--fg)",
                                        fontFamily: "var(--font-sans)",
                                        fontSize: "1rem",
                                        transition: "border-color 0.2s",
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "2rem" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 500,
                                    color: "var(--muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem 1rem",
                                        background: "var(--bg)",
                                        border: "1px solid var(--border)",
                                        color: "var(--fg)",
                                        fontFamily: "var(--font-sans)",
                                        fontSize: "1rem",
                                        opacity: 0.7,
                                        cursor: "not-allowed",
                                    }}
                                    disabled // Email update usually requires verification, disabling for now
                                    title="Email cannot be changed directly"
                                />
                                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                                    To change your email, please contact support.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: "1rem 2rem",
                                    background: "var(--fg)",
                                    color: "var(--bg)",
                                    border: "none",
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    cursor: loading ? "wait" : "pointer",
                                    transition: "opacity 0.2s",
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfileSettings;
