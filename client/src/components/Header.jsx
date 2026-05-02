import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function Header() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('appTitle') || 'FLORA - Inventory Management';

    const metaCharset = document.createElement('meta');
    metaCharset.setAttribute('charSet', 'utf-8');

    const metaViewport = document.createElement('meta');
    metaViewport.name = 'viewport';
    metaViewport.content = 'width=device-width, initial-scale=1';

    if (!document.querySelector('meta[charset="utf-8"]')) document.head.appendChild(metaCharset);
    if (!document.querySelector('meta[name="viewport"]')) document.head.appendChild(metaViewport);

    // Kept FontAwesome just in case some legacy components use it before full rewrite
    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href = '/css/fontawesome.min.css';
    document.head.append(link2);

    return () => {
      if (document.head.contains(link2)) document.head.removeChild(link2);
    };
  }, [t]);

  return null;
}

export default Header;