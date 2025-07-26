import React from 'react';
import Icon from '../Icon/Icon';
import '../../styles/common/buttons.css';

const QAddButton = () => {
    return (
        <button className="q-add-button">
            <Icon name="plus" size={24} />
            <span>Қалауым</span>
        </button>
    );
};

export default QAddButton;
