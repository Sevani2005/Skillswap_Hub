/** Default avatar when none uploaded or image fails to load */
export const getAvatarUrl = (user) => {
  if (user?.avatar) return user.avatar;
  const name = encodeURIComponent(user?.name || 'User');
  return `https://ui-avatars.com/api/?name=${name}&background=7c3aed&color=fff&size=256`;
};
