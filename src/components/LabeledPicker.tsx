"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/LabeledPicker.module.css";

interface PickerItem {
  label: string;
  value: any;
}

interface LabeledPickerProps {
  label: string;
  selectedValue: any;
  onValueChange: (itemValue: any, itemIndex: number) => void;
  items: PickerItem[];
  style?: React.CSSProperties;
}

const LabeledPicker: React.FC<LabeledPickerProps> = ({
  label,
  selectedValue,
  onValueChange,
  items,
  style,
}) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    // 선택된 인덱스 계산 (옵션에 따라 다를 수 있음)
    const index = items.findIndex((item) => String(item.value) === value);
    onValueChange(value, index);
  };

  return (
    <div className={styles.container} style={style}>
      <label className={styles.label}>{label}</label>
      <select
        className={styles.picker}
        value={selectedValue}
        onChange={handleChange}
      >
        {items.map((item, index) => (
          <option key={index} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LabeledPicker;
