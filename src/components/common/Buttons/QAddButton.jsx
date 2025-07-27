import React from 'react';
import Icon from '../Icon/Icon';
import '../../../styles/common/buttons.css';
import '../../../styles/common/typography.css'
import { useTranslation } from 'react-i18next';

const QAddButton = ({ onClick }) => {
    const { t } = useTranslation();
    return (
        <button className="q-add-button" onClick={onClick}>
            <Icon name="edit" size={16} />
            <span className="body2">{t('dashboard.createWishlist')}</span>
        </button>
    );
};

QAddButton.defaultProps = {
    onClick: () => {}
};

export default QAddButton;