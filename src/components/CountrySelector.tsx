"use client";

import React from "react";
import styles from "../styles/components/CountrySelector.module.css";

// Country 타입 정의 (flag는 웹에서는 URL 문자열로 가정)
export interface Country {
  name: string;
  flag: string; 
  latitude?: number;
  longitude?: number;
}

interface CountrySelectorProps {
  countries: Country[];
  selectedCountry: string;
  onSelectCountry: (country: Country) => void;
}

interface CountryItemProps {
  country: Country;
  isSelected: boolean;
  onPress: () => void;
}

const CountryItem: React.FC<CountryItemProps> = ({ country, isSelected, onPress }) => {
  return (
    <button
      onClick={onPress}
      className={`${styles.countryButton} ${isSelected ? styles.selectedCountryButton : ""}`}
    >
      <img src={country.flag} alt={country.name} className={styles.countryFlag} />
      <span className={styles.countryName}>{country.name}</span>
      {isSelected && (
        <div className={styles.checkMarkContainer}>
          <span className={styles.checkMark}>✓</span>
        </div>
      )}
    </button>
  );
};

const CountrySelector: React.FC<CountrySelectorProps> = ({
  countries,
  selectedCountry,
  onSelectCountry,
}) => {
  return (
    <div className={styles.countryScroll}>
      <div className={styles.countryScrollContainer}>
        {countries.map((country) => {
          const isSelected = selectedCountry === country.name;
          return (
            <CountryItem
              key={country.name}
              country={country}
              isSelected={isSelected}
              onPress={() => onSelectCountry(country)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CountrySelector;
