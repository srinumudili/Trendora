export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

export const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

export const sanitizeString = (str) => {
  if (!str || typeof str !== "string") return str;
  return str.replace(/<[^>]*>/g, "").trim();
};

export const isValidPrice = (price) => {
  return typeof price === "number" && price >= 0 && isFinite(price);
};

export const isValidStock = (stock) => {
  return Number.isInteger(stock) && stock >= 0;
};

export const isValidRating = (rating) => {
  return (
    typeof rating === "number" && rating >= 1 && rating <= 5 && isFinite(rating)
  );
};

export const isValidQuantity = (quantity) => {
  return Number.isInteger(quantity) && quantity > 0;
};

export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidBase64Image = (str) => {
  if (!str || typeof str !== "string") return false;
  return str.startsWith("data:image/");
};

export const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return sanitizeString(input);
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (input && typeof input === "object") {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
};

export const validateProductInput = (input) => {
  const errors = [];

  if (!input.name || input.name.trim().length === 0) {
    errors.push("Product name is required");
  }

  if (input.name && input.name.length > 15) {
    errors.push("Product name must be less than 15 characters");
  }

  if (!input.description || input.description.trim().length === 0) {
    errors.push("Product description is required");
  }

  if (!isValidPrice(input.price)) {
    errors.push("Valid price is required");
  }

  if (!isValidStock(input.stock)) {
    errors.push("Valid stock quantity is required");
  }

  if (!input.category || input.category.trim().length === 0) {
    errors.push("Product category is required");
  }

  if (!input.images || input.images.length === 0) {
    errors.push("At least one product image is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateOrderInput = (input) => {
  const errors = [];

  if (!input.orderItems || input.orderItems.length === 0) {
    errors.push("Order must contain at least one item");
  }

  if (!input.shippingAddress) {
    errors.push("Shipping address is required");
  } else {
    if (!input.shippingAddress.address?.trim()) {
      errors.push("Street address is required");
    }
    if (!input.shippingAddress.city?.trim()) {
      errors.push("City is required");
    }
    if (!input.shippingAddress.postalCode?.trim()) {
      errors.push("Postal code is required");
    }
    if (!input.shippingAddress.country?.trim()) {
      errors.push("Country is required");
    }
  }

  if (!isValidPrice(input.totalPrice)) {
    errors.push("Valid total price is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUserRegistration = (name, email, password) => {
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push("Name is required");
  }

  if (name && name.length > 20) {
    errors.push("Name must be less than 20 characters");
  }

  if (!isValidEmail(email)) {
    errors.push("Valid email is required");
  }

  if (!isValidPassword(password)) {
    errors.push("Password must be at least 6 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
