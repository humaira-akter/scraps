/* -------------------------------------------------------------
  Dammam ACs & Appliances Website - Main Logic
  Features: Language Toggler, Mobile Navigation, Accordions, Estimator
------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Language Toggle & Initialization
  let currentLang = localStorage.getItem("lang") || "ar";
  initLanguage(currentLang);

  const langBtn = document.getElementById("lang-toggle-btn");
  if (langBtn) {
    langBtn.addEventListener("click", () => {
      currentLang = currentLang === "ar" ? "en" : "ar";
      initLanguage(currentLang);
    });
  }

  // 2. Mobile Menu Toggle
  const mobileToggleBtn = document.getElementById("mobile-toggle-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileToggleBtn && mobileMenu) {
    mobileToggleBtn.addEventListener("click", () => {
      const isVisible = mobileMenu.style.display === "flex";
      mobileMenu.style.display = isVisible ? "none" : "flex";
    });
  }

  // Close mobile menu on link click
  const mobileMenuLinks = document.querySelectorAll("#mobile-menu a");
  mobileMenuLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (mobileMenu) {
        mobileMenu.style.display = "none";
      }
    });
  });

  // 3. FAQs Accordion
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    if (question) {
      question.addEventListener("click", () => {
        const isActive = item.classList.contains("active");
        
        // Close all active items
        faqItems.forEach(el => el.classList.remove("active"));
        
        // Toggle current item
        if (!isActive) {
          item.classList.add("active");
        }
      });
    }
  });

  // 4. AC/Appliance Price Estimator
  const itemSelect = document.getElementById("estimator-item");
  const conditionSelect = document.getElementById("estimator-condition");
  const calculateBtn = document.getElementById("estimator-calculate-btn");
  const resultBox = document.getElementById("estimator-result");
  const resultPrice = document.getElementById("estimator-price-range");
  const whatsappQuoteBtn = document.getElementById("estimator-whatsapp-btn");

  // Approximate Price Ranges in SAR [Min, Max] for appliances/equipment
  const priceMatrix = {
    ac: { ar: "مكيف (سبليت/شباك)", en: "AC (Split/Window)", prices: [150, 1500] },
    fridge: { ar: "ثلاجة / فريزر", en: "Refrigerator / Freezer", prices: [300, 2000] },
    washer: { ar: "غسالة", en: "Washing Machine", prices: [200, 1500] },
    scrap: { ar: "سكراب / معادن", en: "Scrap & Metal", prices: [100, 800] },
    cooler: { ar: "وحدة تبريد كبيرة", en: "Large Cooling Unit", prices: [400, 3000] },
    electrical: { ar: "معدات وأجهزة كهربائية", en: "Electrical Equipment", prices: [150, 1200] }
  };

  if (calculateBtn && itemSelect && conditionSelect && resultBox && resultPrice && whatsappQuoteBtn) {
    calculateBtn.addEventListener("click", () => {
      const selectedItem = itemSelect.value;
      const selectedCondition = conditionSelect.value;

      if (!selectedItem || !selectedCondition) {
        alert(currentLang === "ar" ? "الرجاء اختيار النوع والحالة أولاً" : "Please select item type and condition first");
        return;
      }

      const itemData = priceMatrix[selectedItem];
      const basePrices = itemData.prices;
      
      let multiplierMin = 0.5;
      let multiplierMax = 0.5;

      if (selectedCondition === "excellent") {
        multiplierMin = 0.85;
        multiplierMax = 1.0;
      } else if (selectedCondition === "good") {
        multiplierMin = 0.55;
        multiplierMax = 0.8;
      } else if (selectedCondition === "fair") {
        multiplierMin = 0.25;
        multiplierMax = 0.5;
      }

      const estMin = Math.round(basePrices[1] * multiplierMin);
      const estMax = Math.round(basePrices[1] * multiplierMax);
      
      const currencyText = currentLang === "ar" ? "ريال سعودي" : "SAR";
      resultPrice.textContent = `${estMin} - ${estMax} ${currencyText}`;
      resultBox.style.display = "block";

      // Build WhatsApp Message
      const phoneNum = "0573789266";
      const itemText = currentLang === "ar" ? itemData.ar : itemData.en;
      const condText = conditionSelect.options[conditionSelect.selectedIndex].text;
      
      let waMessage = "";
      if (currentLang === "ar") {
        waMessage = `مرحباً، أود بيع مكيّف/جهاز مستعمل:\n- النوع: ${itemText}\n- الحالة: ${condText}\n- القيمة المقدرة: ${estMin} - ${estMax} ريال.\nهل يمكنك فحص الصور وتحديد موعد المعاينة؟`;
      } else {
        waMessage = `Hello, I would like to sell an AC/appliance:\n- Type: ${itemText}\n- Condition: ${condText}\n- Estimated Value: ${estMin} - ${estMax} SAR.\nCan you check the photos and schedule an inspection?`;
      }

      const waUrl = `https://wa.me/${phoneNum}?text=${encodeURIComponent(waMessage)}`;
      whatsappQuoteBtn.setAttribute("href", waUrl);
    });
  }

  // 5. Contact Form Handler (Direct to WhatsApp with Bilingual Fields and Photo Uploads)
  const contactForm = document.getElementById("contact-form");
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const previewContainer = document.getElementById("preview-container");
  let uploadedFiles = [];

  if (dropZone && fileInput && previewContainer) {
    // Trigger file dialog on click
    dropZone.addEventListener("click", () => fileInput.click());

    // Handle drag events
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });

    ["dragleave", "dragend"].forEach(type => {
      dropZone.addEventListener(type, () => {
        dropZone.classList.remove("dragover");
      });
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      const files = e.dataTransfer.files;
      handleFiles(files);
    });

    fileInput.addEventListener("change", () => {
      const files = fileInput.files;
      handleFiles(files);
    });

    function handleFiles(files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        
        uploadedFiles.push(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const thumb = document.createElement("div");
          thumb.className = "preview-thumb";
          
          const img = document.createElement("img");
          img.src = e.target.result;
          img.alt = file.name;
          
          const removeBtn = document.createElement("button");
          removeBtn.className = "remove-btn";
          removeBtn.innerHTML = "&times;";
          removeBtn.type = "button";
          removeBtn.addEventListener("click", (evt) => {
            evt.stopPropagation();
            const index = uploadedFiles.indexOf(file);
            if (index > -1) {
              uploadedFiles.splice(index, 1);
            }
            thumb.remove();
          });
          
          thumb.appendChild(img);
          thumb.appendChild(removeBtn);
          previewContainer.appendChild(thumb);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("contact-name").value;
      const phone = document.getElementById("contact-phone").value;
      const typeSelect = document.getElementById("contact-type");
      const selectedType = typeSelect ? typeSelect.options[typeSelect.selectedIndex].text : "مكيف / Appliance";
      const details = document.getElementById("contact-details").value;

      if (!name || !phone || !details) {
        alert(currentLang === "ar" ? "الرجاء ملء جميع الحقول المطلوبة" : "Please fill in all required fields");
        return;
      }

      const phoneNum = "0573789266";
      const photoCount = uploadedFiles.length;
      
      let waMessage = "";
      if (currentLang === "ar") {
        waMessage = `طلب تقييم مكيّف/جهاز جديد:\n- الاسم: ${name}\n- الجوال: ${phone}\n- النوع: ${selectedType}\n- التفاصيل:\n${details}\n- عدد الصور المرفقة: ${photoCount > 0 ? photoCount + ' صور (سأقوم بإرسالها الآن)' : 'لا توجد (سأرسلها لاحقاً)'}`;
      } else {
        waMessage = `New AC/Appliance Valuation Request:\n- Name: ${name}\n- Phone: ${phone}\n- Type: ${selectedType}\n- Details:\n${details}\n- Attached Photos: ${photoCount > 0 ? photoCount + ' photos (sending them now)' : 'none (will send in chat)'}`;
      }

      window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(waMessage)}`, "_blank");
    });
  }
});

// Helper function to update page text content based on translation keys
function initLanguage(lang) {
  localStorage.setItem("lang", lang);
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

  // Select all items containing data-i18n
  const translatableElements = document.querySelectorAll("[data-i18n]");
  translatableElements.forEach(element => {
    const key = element.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      // Check if it's input/textarea placeholder
      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        element.setAttribute("placeholder", translations[lang][key]);
      } else {
        element.innerHTML = translations[lang][key];
      }
    }
  });

  // Adjust placeholder translations manually in case of dropdown options
  const itemSelect = document.getElementById("estimator-item");
  const selectPlaceholderKey = "estimatorSelectPlaceholder";
  if (itemSelect && translations[lang][selectPlaceholderKey]) {
    itemSelect.options[0].text = translations[lang][selectPlaceholderKey];
  }

  // Update dynamic elements
  const langBtn = document.getElementById("lang-toggle-btn");
  if (langBtn) {
    langBtn.innerHTML = `
      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
      <span>${translations[lang]["langToggle"]}</span>
    `;
  }
}
