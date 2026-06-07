import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const emptySkill = { name: '', category: 'Technology', level: 'Intermediate' };

const EditProfile = () => {
  const { user, updateUser, fetchMe } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    bio: '',
    skillsOffered: [emptySkill],
    skillsWanted: [emptySkill],
    socialLinks: { github: '', linkedin: '', twitter: '', website: '' },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        skillsOffered: user.skillsOffered?.length ? user.skillsOffered : [emptySkill],
        skillsWanted: user.skillsWanted?.length ? user.skillsWanted : [emptySkill],
        socialLinks: user.socialLinks || { github: '', linkedin: '', twitter: '', website: '' },
      });
    }
  }, [user]);

  const updateSkill = (type, index, field, value) => {
    const skills = [...form[type]];
    skills[index] = { ...skills[index], [field]: value };
    setForm({ ...form, [type]: skills });
  };

  const addSkill = (type) => {
    setForm({ ...form, [type]: [...form[type], { ...emptySkill }] });
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const { data } = await api.post('/users/avatar', { image: reader.result });
        updateUser(data.data);
      } catch (err) {
        alert(err.response?.data?.message || 'Avatar upload failed. Try a smaller image.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const sanitizedForm = {
        ...form,
        skillsOffered: form.skillsOffered
          .map((s) => ({ ...s, name: s.name.trim() }))
          .filter((s) => s.name !== ''),
        skillsWanted: form.skillsWanted
          .map((s) => ({ ...s, name: s.name.trim() }))
          .filter((s) => s.name !== ''),
      };
      const { data } = await api.put('/users/profile', sanitizedForm);
      updateUser(data.data);
      navigate('/profile/me');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <Sidebar />
        <main className="flex-1">
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>

            <div>
              <label className="form-label mb-2">Profile Photo</label>
              <input type="file" accept="image/*" onChange={handleAvatar} className="text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>

            <div>
              <label className="form-label">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field" rows={4} />
            </div>

            {['skillsOffered', 'skillsWanted'].map((type) => (
              <div key={type}>
                <div className="flex justify-between items-center mb-2">
                  <label className="form-label capitalize mb-0">{type.replace('skills', 'Skills ')}</label>
                  <button type="button" onClick={() => addSkill(type)} className="text-sm text-primary-600">+ Add</button>
                </div>
                {form[type].map((skill, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      placeholder="Skill name"
                      value={skill.name}
                      onChange={(e) => updateSkill(type, i, 'name', e.target.value)}
                      className="input-field"
                    />
                    <select value={skill.category} onChange={(e) => updateSkill(type, i, 'category', e.target.value)} className="input-field">
                      {['Technology', 'Design', 'Languages', 'Business', 'Creative', 'Music'].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <select value={skill.level} onChange={(e) => updateSkill(type, i, 'level', e.target.value)} className="input-field">
                      {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ))}

            <div>
              <label className="form-label mb-2">Social Links</label>
              {Object.keys(form.socialLinks).map((key) => (
                <input
                  key={key}
                  placeholder={key}
                  value={form.socialLinks[key]}
                  onChange={(e) =>
                    setForm({ ...form, socialLinks: { ...form.socialLinks, [key]: e.target.value } })
                  }
                  className="input-field mb-2"
                />
              ))}
            </div>

            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </motion.form>
        </main>
      </div>
    </div>
  );
};

export default EditProfile;
