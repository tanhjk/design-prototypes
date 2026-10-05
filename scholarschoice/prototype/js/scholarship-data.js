/* ==========================================================================
   SCHOLAR'S CHOICE — scholarship-data.js
   --------------------------------------------------------------------------
   PLACEHOLDER DATA — every scholarship below is dummy content for layout
   review; values, bonds, deadlines and provider sites are unverified.

   One source for every page that lists or compares scholarships:
     scholarships.html  scholarshipListing() → fetchPage()
     comparison.html    scholarshipCompare()
   Replace this file with an API call at those two points. A plain script
   (not fetch) so the pages still work opened straight from disk.

   Keys must match the filter checkbox values on scholarships.html:
     levels       pre-u | ug | masters | phd | mid
     courses      see labels.course
     nationality  sc | pr | others
     location     local | overseas
     value        free text shown on the card; each distinct value becomes
                  an option in the scholarships.html "Value" filter
     sponsorship  25 | 50 | 100          (percentage of costs covered)
     bond         0–6                    (years; the longest term offered)
     tag          soon | open | new
     keywords     optional extra words for free-text search
     id           unique slug — used in comparison.html?ids=…
     url          detail page; applyUrl the provider's application page

   labels holds the display name for every key, and must match the text
   of the filter checkboxes.
   ========================================================================== */
window.SC_DATA = {
  "providers": {
    "aic": {"name":  "Agency for Integrated Care", "logo":  "images/aic-logo.png", "site":  "https://www.aic.sg/"},
    "astar": {"name":  "A*STAR", "mono":  "A*", "site":  "https://www.a-star.edu.sg/"},
    "dsta": {"name":  "Defence Science & Technology Agency", "logo":  "images/dsta-logo.png", "site":  "https://www.dsta.gov.sg/"},
    "govtech": {"name":  "GovTech", "mono":  "GT", "site":  "https://www.tech.gov.sg/"},
    "ica": {"name":  "Immigration & Checkpoints Authority", "mono":  "ICA", "site":  "https://www.ica.gov.sg/"},
    "imda": {"name":  "Infocomm Media Development Authority", "mono":  "IMDA", "site":  "https://www.imda.gov.sg/"},
    "lta": {"name":  "Land Transport Authority", "mono":  "LTA", "site":  "https://www.lta.gov.sg/"},
    "mas": {"name":  "Monetary Authority of Singapore", "mono":  "MAS", "site":  "https://www.mas.gov.sg/"},
    "moe": {"name":  "Ministry of Education", "mono":  "MOE", "site":  "https://www.moe.gov.sg/"},
    "mha": {"name":  "Ministry of Home Affairs", "logo":  "images/mha-logo.png", "site":  "https://www.mha.gov.sg/"},
    "nparks": {"name":  "National Parks Board", "logo":  "images/npark-logo.png", "site":  "https://www.nparks.gov.sg/"},
    "ntu": {"name":  "Nanyang Technological University", "mono":  "NTU", "site":  "https://www.ntu.edu.sg/"},
    "nus": {"name":  "National University of Singapore", "mono":  "NUS", "site":  "https://www.nus.edu.sg/"},
    "psc": {"name":  "Public Service Commission", "logo":  "images/psc-logo.png", "site":  "https://www.psc.gov.sg/"},
    "scdf": {"name":  "Singapore Civil Defence Force", "mono":  "SCDF", "site":  "https://www.scdf.gov.sg/"},
    "sgis": {"name":  "Singapore-Industry Scholarship", "logo":  "images/sgis-logo.png", "site":  "https://www.sgis.gov.sg/"},
    "smf": {"name":  "Singapore Maritime Foundation", "logo":  "images/smf-logo.png", "site":  "https://www.smf.com.sg/"},
    "smu": {"name":  "Singapore Management University", "logo":  "images/smu-logo.png", "site":  "https://www.smu.edu.sg/"},
    "spf": {"name":  "Singapore Police Force", "mono":  "SPF", "site":  "https://www.police.gov.sg/"},
    "tf": {"name":  "Temasek Foundation", "mono":  "TF", "site":  "https://www.temasekfoundation.org.sg/"}
  },
  "labels": {
    "provider": {
      "aic": "Agency for Integrated Care",
      "astar": "A*STAR",
      "dsta": "Defence Science & Technology Agency",
      "govtech": "GovTech",
      "ica": "Immigration & Checkpoints Authority",
      "imda": "Infocomm Media Development Authority",
      "lta": "Land Transport Authority",
      "mas": "Monetary Authority of Singapore",
      "moe": "Ministry of Education",
      "mha": "Ministry of Home Affairs",
      "nparks": "National Parks Board",
      "ntu": "Nanyang Technological University",
      "nus": "National University of Singapore",
      "psc": "Public Service Commission",
      "scdf": "Singapore Civil Defence Force",
      "sgis": "Singapore-Industry Scholarship",
      "smf": "Singapore Maritime Foundation",
      "smu": "Singapore Management University",
      "spf": "Singapore Police Force",
      "tf": "Temasek Foundation"
    },
    "course": {
      "architecture": "Architecture & Urban Planning",
      "arts": "Arts & Music",
      "business": "Business & Accountancy",
      "computing": "Computer Science & IT",
      "data-ai": "Data Science & AI",
      "design": "Design & Media",
      "economics": "Economics",
      "education": "Education",
      "engineering": "Engineering",
      "environment": "Environmental Studies",
      "finance": "Finance",
      "hospitality": "Hospitality & Tourism",
      "humanities": "Humanities",
      "law": "Law",
      "life-sci": "Life Sciences",
      "maritime": "Maritime Studies",
      "math": "Mathematics",
      "medicine": "Medicine",
      "nursing": "Nursing & Allied Health",
      "pharmacy": "Pharmacy",
      "physical-sci": "Physical Sciences",
      "psychology": "Psychology",
      "public-policy": "Public Policy",
      "social-sci": "Social Sciences"
    },
    "nationality": {
      "sc": "Singapore Citizen",
      "pr": "Singapore PR",
      "others": "Others"
    },
    "level": {
      "pre-u": "Pre-university / Polytechnic",
      "ug": "Undergraduate",
      "masters": "Postgraduate (Masters)",
      "phd": "Postgraduate (PhD)",
      "mid": "Mid-career / Professional"
    },
    "location": {
      "local": "Local",
      "overseas": "Overseas"
    }
  },
  "scholarships": [
    { "id":  "dsta-scholarship-overseas", "name":  "DSTA Scholarship (Overseas)", "provider":  "dsta", "tag":  "soon", "value":  "Full fees + allowance", "bond":  6, "level":  "Undergrad → PhD", "study":  "Overseas or local", "deadline":  "Closes 30 Oct",
      "levels":  ["ug", "phd"], "courses":  ["engineering", "computing", "data-ai", "physical-sci"], "nationality":  ["sc"], "location":  ["local", "overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.dsta.gov.sg/" },
    { "id":  "psc-scholarship-overseas-merit", "name":  "PSC Scholarship (Overseas Merit)", "provider":  "psc", "tag":  "open", "value":  "Full fees + living", "bond":  6, "level":  "Undergraduate", "study":  "UK, US, EU, Asia", "deadline":  "Closes 14 Nov",
      "levels":  ["ug"], "courses":  ["economics", "law", "public-policy", "social-sci", "humanities", "engineering"], "nationality":  ["sc"], "location":  ["overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.psc.gov.sg/" },
    { "id":  "home-affairs-uniformed-scholarship-local", "name":  "Home Affairs Uniformed Scholarship (Local)", "provider":  "mha", "tag":  "open", "value":  "Full fees + $6k grant", "bond":  4, "level":  "Undergraduate", "study":  "Local universities", "deadline":  "Closes 21 Nov",
      "levels":  ["ug"], "courses":  ["social-sci", "psychology", "law", "computing", "public-policy"], "nationality":  ["sc"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.mha.gov.sg/" },
    { "id":  "healthcare-merit-scholarship", "name":  "Healthcare Merit Scholarship", "provider":  "aic", "tag":  "open", "value":  "Full fees + allowance", "bond":  4, "level":  "Undergraduate", "study":  "Local universities", "deadline":  "Closes 05 Dec",
      "keywords":  "biomedical healthcare", "levels":  ["ug"], "courses":  ["medicine", "nursing", "life-sci", "psychology"], "nationality":  ["sc", "pr"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.aic.sg/" },
    { "id":  "nparks-undergraduate-scholarship", "name":  "NParks Undergraduate Scholarship", "provider":  "nparks", "tag":  "open", "value":  "Full fees + laptop", "bond":  4, "level":  "Undergraduate", "study":  "Local or overseas", "deadline":  "Closes 12 Dec",
      "levels":  ["ug"], "courses":  ["environment", "life-sci", "architecture"], "nationality":  ["sc", "pr"], "location":  ["local", "overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.nparks.gov.sg/" },
    { "id":  "smu-global-impact-scholarship", "name":  "SMU Global Impact Scholarship", "provider":  "smu", "tag":  "soon", "value":  "Full fees + stipend", "bond":  0, "level":  "Undergraduate", "study":  "SMU, with exchange", "deadline":  "Closes 28 Nov",
      "levels":  ["ug"], "courses":  ["business", "economics", "law", "computing", "social-sci"], "nationality":  ["sc", "pr", "others"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.smu.edu.sg/" },
    { "id":  "singapore-industry-scholarship", "name":  "Singapore-Industry Scholarship", "provider":  "sgis", "tag":  "open", "value":  "Full fees + allowance", "bond":  6, "bondText":  "4 to 6 years", "level":  "Undergraduate", "study":  "Local or overseas", "deadline":  "Closes 19 Dec",
      "levels":  ["ug"], "courses":  ["engineering", "computing", "data-ai", "business", "physical-sci"], "nationality":  ["sc"], "location":  ["local", "overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.sgis.gov.sg/" },
    { "id":  "maritimeone-scholarship", "name":  "MaritimeONE Scholarship", "provider":  "smf", "tag":  "open", "value":  "Up to $20k a year", "bond":  3, "bondText":  "2 to 3 years", "level":  "Diploma → degree", "study":  "Local or overseas", "deadline":  "Closes 31 Jan",
      "levels":  ["pre-u", "ug"], "courses":  ["maritime", "engineering", "business"], "nationality":  ["sc", "pr"], "location":  ["local", "overseas"], "sponsorship":  50, "url":  "scholarship-template.html", "applyUrl":  "https://www.smf.com.sg/" },
    { "id":  "psc-scholarship-public-administration", "name":  "PSC Scholarship (Public Administration)", "provider":  "psc", "tag":  "open", "value":  "Full fees + living", "bond":  6, "level":  "Undergraduate", "study":  "UK, US, EU, Asia", "deadline":  "Closes 14 Nov",
      "levels":  ["ug"], "courses":  ["public-policy", "economics", "social-sci", "humanities"], "nationality":  ["sc"], "location":  ["local", "overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.psc.gov.sg/" },
    { "id":  "a-star-national-science-scholarship", "name":  "A*STAR National Science Scholarship", "provider":  "astar", "tag":  "open", "value":  "Full fees + stipend", "bond":  6, "level":  "Undergrad → PhD", "study":  "Overseas", "deadline":  "Closes 15 Jan",
      "keywords":  "biomedical research", "levels":  ["ug", "phd"], "courses":  ["life-sci", "physical-sci", "engineering", "math", "data-ai"], "nationality":  ["sc", "pr"], "location":  ["overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.a-star.edu.sg/" },
    { "id":  "a-star-graduate-scholarship", "name":  "A*STAR Graduate Scholarship", "provider":  "astar", "tag":  "open", "value":  "Full fees + $3.2k a month", "bond":  4, "level":  "PhD", "study":  "Local universities", "deadline":  "Closes 31 Jan",
      "keywords":  "biomedical research", "levels":  ["phd"], "courses":  ["life-sci", "physical-sci", "engineering", "computing"], "nationality":  ["sc", "pr", "others"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.a-star.edu.sg/" },
    { "id":  "moe-teaching-scholarship", "name":  "MOE Teaching Scholarship", "provider":  "moe", "tag":  "soon", "value":  "Full fees + allowance", "bond":  4, "level":  "Undergraduate", "study":  "Local or overseas", "deadline":  "Closes 31 Oct",
      "levels":  ["ug"], "courses":  ["education", "humanities", "math", "physical-sci", "life-sci"], "nationality":  ["sc"], "location":  ["local", "overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.moe.gov.sg/" },
    { "id":  "moe-teaching-award-postgraduate", "name":  "MOE Teaching Award (Postgraduate)", "provider":  "moe", "tag":  "open", "value":  "Fees + salary", "bond":  3, "level":  "Masters", "study":  "Local (NIE)", "deadline":  "Closes 30 Nov",
      "levels":  ["masters", "mid"], "courses":  ["education"], "nationality":  ["sc", "pr"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.moe.gov.sg/" },
    { "id":  "nus-global-merit-scholarship", "name":  "NUS Global Merit Scholarship", "provider":  "nus", "tag":  "open", "value":  "Full fees + $6k a year", "bond":  0, "level":  "Undergraduate", "study":  "NUS", "deadline":  "Closes 15 Jan",
      "keywords":  "biomedical", "levels":  ["ug"], "courses":  ["engineering", "computing", "business", "humanities", "law", "medicine"], "nationality":  ["sc", "pr", "others"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.nus.edu.sg/" },
    { "id":  "nus-merit-scholarship", "name":  "NUS Merit Scholarship", "provider":  "nus", "tag":  "open", "value":  "Tuition fees only", "bond":  0, "level":  "Undergraduate", "study":  "NUS", "deadline":  "Closes 15 Jan",
      "levels":  ["ug"], "courses":  ["engineering", "computing", "business", "humanities", "social-sci", "physical-sci"], "nationality":  ["sc", "pr", "others"], "location":  ["local"], "sponsorship":  50, "url":  "scholarship-template.html", "applyUrl":  "https://www.nus.edu.sg/" },
    { "id":  "nanyang-scholarship", "name":  "Nanyang Scholarship", "provider":  "ntu", "tag":  "open", "value":  "Full fees + $6.5k a year", "bond":  0, "level":  "Undergraduate", "study":  "NTU", "deadline":  "Closes 19 Mar",
      "levels":  ["ug"], "courses":  ["engineering", "computing", "business", "design", "life-sci"], "nationality":  ["sc", "pr", "others"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.ntu.edu.sg/" },
    { "id":  "cn-yang-scholarship", "name":  "CN Yang Scholarship", "provider":  "ntu", "tag":  "new", "value":  "Full fees + research stipend", "bond":  0, "level":  "Undergraduate", "study":  "NTU", "deadline":  "Closes 19 Mar",
      "levels":  ["ug"], "courses":  ["physical-sci", "engineering", "math", "life-sci"], "nationality":  ["sc", "pr", "others"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.ntu.edu.sg/" },
    { "id":  "govtech-scholarship", "name":  "GovTech Scholarship", "provider":  "govtech", "tag":  "soon", "value":  "Full fees + allowance", "bond":  4, "level":  "Undergraduate", "study":  "Local or overseas", "deadline":  "Closes 10 Nov",
      "levels":  ["ug"], "courses":  ["computing", "data-ai", "design"], "nationality":  ["sc"], "location":  ["local", "overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.tech.gov.sg/" },
    { "id":  "mas-undergraduate-scholarship", "name":  "MAS Undergraduate Scholarship", "provider":  "mas", "tag":  "open", "value":  "Full fees + allowance", "bond":  5, "level":  "Undergraduate", "study":  "UK, US or local", "deadline":  "Closes 31 Dec",
      "levels":  ["ug"], "courses":  ["economics", "finance", "math", "data-ai"], "nationality":  ["sc"], "location":  ["local", "overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.mas.gov.sg/" },
    { "id":  "mas-postgraduate-scholarship", "name":  "MAS Postgraduate Scholarship", "provider":  "mas", "tag":  "open", "value":  "Full fees + salary", "bond":  4, "level":  "Masters", "study":  "Overseas", "deadline":  "Closes 28 Feb",
      "levels":  ["masters", "mid"], "courses":  ["economics", "finance", "public-policy"], "nationality":  ["sc"], "location":  ["overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.mas.gov.sg/" },
    { "id":  "lta-undergraduate-scholarship", "name":  "LTA Undergraduate Scholarship", "provider":  "lta", "tag":  "open", "value":  "Full fees + allowance", "bond":  4, "level":  "Undergraduate", "study":  "Local universities", "deadline":  "Closes 15 Dec",
      "levels":  ["ug"], "courses":  ["engineering", "architecture", "data-ai"], "nationality":  ["sc", "pr"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.lta.gov.sg/" },
    { "id":  "lta-diploma-scholarship", "name":  "LTA Diploma Scholarship", "provider":  "lta", "tag":  "open", "value":  "Fees + $3k grant", "bond":  2, "level":  "Polytechnic", "study":  "Local polytechnics", "deadline":  "Closes 30 Nov",
      "levels":  ["pre-u"], "courses":  ["engineering"], "nationality":  ["sc", "pr"], "location":  ["local"], "sponsorship":  50, "url":  "scholarship-template.html", "applyUrl":  "https://www.lta.gov.sg/" },
    { "id":  "imda-digital-leaders-scholarship", "name":  "IMDA Digital Leaders Scholarship", "provider":  "imda", "tag":  "open", "value":  "Up to $15k a year", "bond":  2, "level":  "Undergraduate", "study":  "Local universities", "deadline":  "Closes 31 Jan",
      "levels":  ["ug"], "courses":  ["computing", "design", "data-ai"], "nationality":  ["sc", "pr"], "location":  ["local"], "sponsorship":  50, "url":  "scholarship-template.html", "applyUrl":  "https://www.imda.gov.sg/" },
    { "id":  "imda-media-talent-award", "name":  "IMDA Media Talent Award", "provider":  "imda", "tag":  "new", "value":  "Up to $10k a year", "bond":  1, "level":  "Diploma → degree", "study":  "Local or overseas", "deadline":  "Closes 28 Feb",
      "levels":  ["pre-u", "ug"], "courses":  ["design", "arts"], "nationality":  ["sc", "pr"], "location":  ["local", "overseas"], "sponsorship":  25, "url":  "scholarship-template.html", "applyUrl":  "https://www.imda.gov.sg/" },
    { "id":  "temasek-foundation-leaders-scholarship", "name":  "Temasek Foundation Leaders Scholarship", "provider":  "tf", "tag":  "open", "value":  "Full fees + stipend", "bond":  0, "level":  "Undergraduate", "study":  "Local universities", "deadline":  "Closes 15 Jan",
      "levels":  ["ug"], "courses":  ["social-sci", "public-policy", "business", "humanities"], "nationality":  ["sc", "pr", "others"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.temasekfoundation.org.sg/" },
    { "id":  "temasek-foundation-community-award", "name":  "Temasek Foundation Community Award", "provider":  "tf", "tag":  "open", "value":  "$5k a year", "bond":  0, "level":  "Pre-U / Polytechnic", "study":  "Local", "deadline":  "Closes 31 Mar",
      "levels":  ["pre-u"], "courses":  ["humanities", "business", "engineering"], "nationality":  ["sc", "pr", "others"], "location":  ["local"], "sponsorship":  25, "url":  "scholarship-template.html", "applyUrl":  "https://www.temasekfoundation.org.sg/" },
    { "id":  "spf-overseas-scholarship", "name":  "SPF Overseas Scholarship", "provider":  "spf", "tag":  "soon", "value":  "Full fees + salary", "bond":  6, "level":  "Undergraduate", "study":  "Overseas", "deadline":  "Closes 07 Nov",
      "levels":  ["ug"], "courses":  ["law", "psychology", "social-sci", "computing"], "nationality":  ["sc"], "location":  ["overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.police.gov.sg/" },
    { "id":  "spf-local-scholarship", "name":  "SPF Local Scholarship", "provider":  "spf", "tag":  "soon", "value":  "Full fees + salary", "bond":  4, "level":  "Undergraduate", "study":  "Local universities", "deadline":  "Closes 07 Nov",
      "levels":  ["ug"], "courses":  ["law", "psychology", "social-sci", "computing"], "nationality":  ["sc"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.police.gov.sg/" },
    { "id":  "scdf-undergraduate-scholarship", "name":  "SCDF Undergraduate Scholarship", "provider":  "scdf", "tag":  "open", "value":  "Full fees + salary", "bond":  4, "level":  "Undergraduate", "study":  "Local or overseas", "deadline":  "Closes 30 Nov",
      "levels":  ["ug"], "courses":  ["engineering", "life-sci", "psychology"], "nationality":  ["sc"], "location":  ["local", "overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.scdf.gov.sg/" },
    { "id":  "ica-scholarship", "name":  "ICA Scholarship", "provider":  "ica", "tag":  "open", "value":  "Full fees + allowance", "bond":  4, "level":  "Undergraduate", "study":  "Local universities", "deadline":  "Closes 21 Nov",
      "levels":  ["ug"], "courses":  ["computing", "data-ai", "social-sci", "law"], "nationality":  ["sc"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.ica.gov.sg/" },
    { "id":  "dsta-scholarship-local", "name":  "DSTA Scholarship (Local)", "provider":  "dsta", "tag":  "soon", "value":  "Full fees + allowance", "bond":  4, "level":  "Undergraduate", "study":  "Local universities", "deadline":  "Closes 30 Oct",
      "levels":  ["ug"], "courses":  ["engineering", "computing", "data-ai"], "nationality":  ["sc"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.dsta.gov.sg/" },
    { "id":  "dsta-postgraduate-scholarship", "name":  "DSTA Postgraduate Scholarship", "provider":  "dsta", "tag":  "open", "value":  "Fees + salary", "bond":  3, "level":  "Masters → PhD", "study":  "Local or overseas", "deadline":  "Closes 31 Jan",
      "levels":  ["masters", "phd", "mid"], "courses":  ["engineering", "computing", "data-ai", "physical-sci"], "nationality":  ["sc"], "location":  ["local", "overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.dsta.gov.sg/" },
    { "id":  "psc-postgraduate-scholarship-mid-career", "name":  "PSC Postgraduate Scholarship (Mid-Career)", "provider":  "psc", "tag":  "open", "value":  "Full fees + salary", "bond":  4, "level":  "Masters", "study":  "Overseas", "deadline":  "Closes 28 Feb",
      "levels":  ["masters", "mid"], "courses":  ["public-policy", "economics", "law"], "nationality":  ["sc"], "location":  ["overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.psc.gov.sg/" },
    { "id":  "aic-nursing-sponsorship", "name":  "AIC Nursing Sponsorship", "provider":  "aic", "tag":  "open", "value":  "Fees + $500 a month", "bond":  3, "level":  "Diploma", "study":  "Local polytechnics", "deadline":  "Closes 15 Dec",
      "levels":  ["pre-u"], "courses":  ["nursing"], "nationality":  ["sc", "pr"], "location":  ["local"], "sponsorship":  50, "url":  "scholarship-template.html", "applyUrl":  "https://www.aic.sg/" },
    { "id":  "allied-health-postgraduate-award", "name":  "Allied Health Postgraduate Award", "provider":  "aic", "tag":  "new", "value":  "Fees + salary", "bond":  3, "level":  "Masters", "study":  "Local or overseas", "deadline":  "Closes 31 Mar",
      "levels":  ["masters", "mid"], "courses":  ["nursing", "psychology", "life-sci"], "nationality":  ["sc", "pr"], "location":  ["local", "overseas"], "sponsorship":  50, "url":  "scholarship-template.html", "applyUrl":  "https://www.aic.sg/" },
    { "id":  "home-affairs-uniformed-scholarship-overseas", "name":  "Home Affairs Uniformed Scholarship (Overseas)", "provider":  "mha", "tag":  "open", "value":  "Full fees + living", "bond":  6, "level":  "Undergraduate", "study":  "Overseas", "deadline":  "Closes 21 Nov",
      "levels":  ["ug"], "courses":  ["social-sci", "psychology", "law", "public-policy", "computing"], "nationality":  ["sc"], "location":  ["overseas"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.mha.gov.sg/" },
    { "id":  "nparks-diploma-scholarship", "name":  "NParks Diploma Scholarship", "provider":  "nparks", "tag":  "open", "value":  "Fees + $2k grant", "bond":  2, "level":  "Polytechnic", "study":  "Local polytechnics", "deadline":  "Closes 31 Jan",
      "levels":  ["pre-u"], "courses":  ["environment", "life-sci"], "nationality":  ["sc", "pr"], "location":  ["local"], "sponsorship":  50, "url":  "scholarship-template.html", "applyUrl":  "https://www.nparks.gov.sg/" },
    { "id":  "smu-merit-scholarship", "name":  "SMU Merit Scholarship", "provider":  "smu", "tag":  "open", "value":  "50% of tuition", "bond":  0, "level":  "Undergraduate", "study":  "SMU", "deadline":  "Closes 19 Mar",
      "levels":  ["ug"], "courses":  ["business", "law", "economics", "social-sci", "computing"], "nationality":  ["sc", "pr", "others"], "location":  ["local"], "sponsorship":  50, "url":  "scholarship-template.html", "applyUrl":  "https://www.smu.edu.sg/" },
    { "id":  "smu-postgraduate-research-scholarship", "name":  "SMU Postgraduate Research Scholarship", "provider":  "smu", "tag":  "new", "value":  "Fees + $2.5k a month", "bond":  0, "level":  "PhD", "study":  "SMU", "deadline":  "Closes 31 Mar",
      "levels":  ["phd"], "courses":  ["economics", "business", "finance", "computing"], "nationality":  ["sc", "pr", "others"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.smu.edu.sg/" },
    { "id":  "maritime-leaders-postgraduate-award", "name":  "Maritime Leaders Postgraduate Award", "provider":  "smf", "tag":  "open", "value":  "Up to $30k", "bond":  2, "level":  "Masters", "study":  "Local or overseas", "deadline":  "Closes 31 Mar",
      "levels":  ["masters", "mid"], "courses":  ["maritime", "business", "law"], "nationality":  ["sc", "pr"], "location":  ["local", "overseas"], "sponsorship":  50, "url":  "scholarship-template.html", "applyUrl":  "https://www.smf.com.sg/" },
    { "id":  "ntu-engineering-talent-award", "name":  "NTU Engineering Talent Award", "provider":  "ntu", "tag":  "open", "value":  "25% of tuition + $2k", "bond":  0, "level":  "Undergraduate", "study":  "NTU", "deadline":  "Closes 19 Mar",
      "levels":  ["ug"], "courses":  ["engineering"], "nationality":  ["sc", "pr", "others"], "location":  ["local"], "sponsorship":  25, "url":  "scholarship-template.html", "applyUrl":  "https://www.ntu.edu.sg/" },
    { "id":  "nus-medicine-scholarship", "name":  "NUS Medicine Scholarship", "provider":  "nus", "tag":  "open", "value":  "Full fees + $6k a year", "bond":  0, "level":  "Undergraduate", "study":  "NUS", "deadline":  "Closes 15 Jan",
      "levels":  ["ug"], "courses":  ["medicine"], "nationality":  ["sc", "pr", "others"], "location":  ["local"], "sponsorship":  100, "url":  "scholarship-template.html", "applyUrl":  "https://www.nus.edu.sg/" },
    { "id":  "moe-pre-university-scholarship", "name":  "MOE Pre-University Scholarship", "provider":  "moe", "tag":  "open", "value":  "School fees + $2.4k a year", "bond":  0, "level":  "Pre-university", "study":  "Local", "deadline":  "Closes 28 Feb",
      "levels":  ["pre-u"], "courses":  ["humanities", "math", "physical-sci", "life-sci"], "nationality":  ["sc", "pr", "others"], "location":  ["local"], "sponsorship":  25, "url":  "scholarship-template.html", "applyUrl":  "https://www.moe.gov.sg/" }
  ]
};
