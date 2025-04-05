"use client";

import React, { useState, useEffect } from "react";
import { useConfig } from "../context/ConfigContext";
import { useTranslation } from "react-i18next";
import axios from "axios";
import styles from "../styles/components/Licenses.module.css";

interface License {
  name: string;
  version?: string;
  license?: string;
  details?: string;
  type?: string;
  description?: string;
  purpose?: string;
  url?: string;
  note?: string;
}

interface LicensesData {
  frontend: License[];
  backend: License[];
  resources: License[];
  apis: License[];
}

const Licenses: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const [licenses, setLicenses] = useState<LicensesData>({
    frontend: [],
    backend: [],
    resources: [],
    apis: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    "frontend" | "backend" | "resources" | "apis"
  >("frontend");

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        console.log("Fetching licenses from:", `${SERVER_URL}/api/licenses`);
        const response = await axios.get(`${SERVER_URL}/api/licenses`);
        console.log("Licenses received:", response.data);
        setLicenses(response.data);
      } catch (error) {
        console.error("Error fetching licenses:", error);
        window.alert(t("error") + ": " + t("failed_to_load_licenses"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLicenses();
  }, [SERVER_URL, t]);

  const categoryLicenses = licenses[selectedCategory];

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div className={styles.pickerContainer}>
            <select
              className={styles.picker}
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value as "frontend" | "backend" | "resources" | "apis"
                )
              }
            >
              <option value="frontend">{t("frontend")}</option>
              <option value="backend">{t("backend")}</option>
              <option value="resources">{t("resources")}</option>
              <option value="apis">{t("external_apis")}</option>
            </select>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            {t("close")}
          </button>
        </div>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
          </div>
        ) : (
          <div className={styles.scrollContent}>
            {categoryLicenses.map((license, index) => (
              <div key={index} className={styles.licenseItem}>
                <p className={styles.libraryName}>{license.name}</p>
                {license.version && (
                  <p className={styles.licenseType}>
                    {t("version")}: {license.version}
                  </p>
                )}
                {license.license && (
                  <p className={styles.licenseType}>
                    {t("license")}: {license.license}
                  </p>
                )}
                {license.details && (
                  <p className={styles.licenseDetails}>
                    {license.details.startsWith("http") ? (
                      <a href={license.details} target="_blank" rel="noopener noreferrer" style={{ color: "blue" }}>
                        {license.details}
                      </a>
                    ) : (
                      license.details
                    )}
                  </p>
                )}
                {license.type && (
                  <p className={styles.licenseType}>
                    {t("type")}: {license.type}
                  </p>
                )}
                {license.description && (
                  <p className={styles.licenseDetails}>{license.description}</p>
                )}
                {license.purpose && (
                  <p className={styles.licenseType}>
                    {t("purpose")}: {license.purpose}
                  </p>
                )}
                {license.url && (
                  <p className={styles.licenseDetails}>
                    <a href={license.url} target="_blank" rel="noopener noreferrer" style={{ color: "blue" }}>
                      {license.url}
                    </a>
                  </p>
                )}
                {license.note && (
                  <p className={styles.licenseDetails}>{license.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Licenses;
