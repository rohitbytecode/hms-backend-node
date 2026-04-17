const checkUniqueUser = async ({ email, phno, excludeId = null }) => {
  const query = {
    $or: [{ email }, { phno }],
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await User.findOne(query);

  if (existing) {
    if (existing.email === email) {
      throw new Error("Email already exists");
    }
    if (existing.phno === phno) {
      throw new Error("Phone number already exists");
    }
  }
};

export { checkUniqueUser };
