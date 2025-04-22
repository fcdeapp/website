"use client";

import React, { useState, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import FriendSearchItem from "./FriendSearchItem";
import styles from "../styles/components/CreateNotificationModal.module.css";

interface CreateNotificationModalProps {
  visible: boolean;
  onClose: () => void;
  selectedRegion: string;
  SERVER_URL: string;
  userId: string | null;
  // buddyGroupId가 전달되면 버디공지 기능으로 동작합니다.
  buddyGroupId?: string;
}

const codeRegex = /^\d{6}$/;
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  visible,
  onClose,
  selectedRegion,
  SERVER_URL,
  userId,
  buddyGroupId,
}) => {
  // 상태 변수들
  const { t } = useTranslation();
  const [createNotificationType, setCreateNotificationType] = useState<"All" | "Individual">("All");
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchPage, setSearchPage] = useState<number>(1);
  const [hasMoreSearch, setHasMoreSearch] = useState<boolean>(true);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [newImage, setNewImage] = useState<string>("");

  // 토글 피커 (select 요소) 노출
  const handleTogglePicker = () => {
    setIsPickerVisible((prev) => !prev);
  };

  // 친구 검색 함수
  const searchUsers = useCallback(async (reset = false) => {
    if (!searchTerm) return;
    setLoadingSearch(true);
    try {
      const pageToFetch = reset ? 1 : searchPage;
      let endpoint = "";
      if (buddyGroupId) {
        // 버디공지인 경우: 해당 버디 그룹 내 멤버 검색
        endpoint = `${SERVER_URL}/buddy-notifications/${buddyGroupId}/members/search?q=${encodeURIComponent(
          searchTerm
        )}&page=${pageToFetch}&limit=20`;
      } else {
        // 관리자용 사용자 검색
        const regionParam = selectedRegion === "all" ? "" : `&region=${selectedRegion}`;
        endpoint = `${SERVER_URL}/api/admin/users/search?q=${encodeURIComponent(
          searchTerm
        )}${regionParam}&page=${pageToFetch}&limit=20`;
      }
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const result = response.data;
      if (reset) {
        setSearchResults(result.users);
        setSearchPage(2);
      } else {
        setSearchResults((prev) => [...prev, ...result.users]);
        setSearchPage(pageToFetch + 1);
      }
      setHasMoreSearch(result.hasMore);
    } catch (error) {
      console.error("Error searching users:", error);
      alert("Failed to search users.");
    } finally {
      setLoadingSearch(false);
    }
  }, [searchTerm, searchPage, buddyGroupId, selectedRegion, SERVER_URL]);

  const toggleUserSelection = (user: any) => {
    const exists = selectedUsers.find((u: any) => u._id === user._id);
    if (exists) {
      setSelectedUsers(selectedUsers.filter((u: any) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // 이미지 선택 함수 (파일 input 활용)
  const pickImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        // 미리보기 URL 생성
        const imageUrl = URL.createObjectURL(file);
        // (옵션) 리사이즈가 필요하면 canvas 등을 활용할 수 있음.
        setNewImage(imageUrl);
      }
    };
    input.click();
  };

  // 공지 전송 함수
  const handleSendCreateNotification = async () => {
    if (!newTitle || !newMessage) {
      alert("Please enter both title and message.");
      return;
    }
    try {
      let imageUrl = "";
      if (newImage) {
        // 이미지 업로드
        const formData = new FormData();
        // 웹에서는 file input이 없으므로 newImage는 미리보기 URL일 뿐임.
        // 실제 업로드를 위해서는 File 객체를 별도로 관리해야 합니다.
        // 여기서는 간단하게 업로드를 시뮬레이션 합니다.
        formData.append("image", newImage);
        const imageResponse = await axios.post(
          `${SERVER_URL}/api/admin/nl/uploadImage`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        imageUrl = imageResponse.data.imageUrl;
      }
      if (buddyGroupId) {
        // [버디공지] branch
        const body: any = {
          title: newTitle,
          message: newMessage,
          type: createNotificationType,
          image: imageUrl || null,
        };
        if (createNotificationType === "Individual") {
          if (selectedUsers.length === 0) {
            alert("Please select at least one user for individual notification.");
            return;
          }
          body.sendTo = selectedUsers.map((u) => u._id);
        }
        await axios.post(`${SERVER_URL}/buddy-notifications/${buddyGroupId}/notifications`, body, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        // [관리자공지] 기존 기능
        if (createNotificationType === "Individual") {
          if (selectedUsers.length === 0) {
            alert("Please select at least one user for individual notification.");
            return;
          }
          const regionGroups = selectedUsers.reduce((acc: { [key: string]: string[] }, user: any) => {
            const region = user.region;
            if (!acc[region]) {
              acc[region] = [];
            }
            acc[region].push(user._id);
            return acc;
          }, {});
          for (const region in regionGroups) {
            const body = {
              title: newTitle,
              message: newMessage,
              image: imageUrl || null,
              type: createNotificationType,
              region: region,
              sendTo: regionGroups[region],
            };
            await axios.post(`${SERVER_URL}/api/admin/nl/postNotifications`, body, {
              headers: {
                "Content-Type": "application/json",
              },
            });
          }
        } else {
          const regionsToSend = selectedRegion === "all" ? ["ap-northeast-2", "ap-southeast-2"] : [selectedRegion];
          for (const region of regionsToSend) {
            const body = {
              title: newTitle,
              message: newMessage,
              image: imageUrl || null,
              type: "All",
              region: region,
            };
            await axios.post(`${SERVER_URL}/api/admin/nl/postNotifications`, body, {
              headers: {
                "Content-Type": "application/json",
              },
            });
          }
        }
      }
      alert("Notification created successfully.");
      // 상태 초기화
      setNewTitle("");
      setNewMessage("");
      setNewImage("");
      setCreateNotificationType("All");
      setSearchTerm("");
      setSearchResults([]);
      setSearchPage(1);
      setHasMoreSearch(true);
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error("Error creating notification:", error);
      alert("Failed to create notification.");
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <button className={styles.deleteIconWrapper} onClick={onClose}>
          <img src="/assets/delete-icon-big.png" alt="Delete" className={styles.deleteIcon} />
        </button>
        <h2 className={styles.modalTitle}>Create Notification</h2>
        <div className={styles.modalSelection}>
          <span className={styles.sectionLabel}>Select Notification Type:</span>
          <button onClick={handleTogglePicker} className={styles.toggleButton}>
            <span className={styles.toggleButtonText}>{createNotificationType}</span>
          </button>
        </div>
        {isPickerVisible && (
          <select
            className={styles.picker}
            value={createNotificationType}
            onChange={(e) => setCreateNotificationType(e.target.value as "All" | "Individual")}
          >
            <option value="All">All Notification</option>
            <option value="Individual">Individual Notification</option>
          </select>
        )}
        {createNotificationType === "Individual" && (
          <div className={styles.searchSection}>
            <input
              className={styles.input}
              placeholder="Search user by nickname or userId"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchPage(1);
              }}
              onBlur={() => searchUsers(true)}
            />
            {loadingSearch && <div className={styles.spinner}></div>}
            <ul className={styles.searchResults}>
              {searchResults.map((item) => (
                <li
                  key={item._id}
                  className={`${styles.searchItemContainer} ${
                    selectedUsers.find((u: any) => u._id === item._id) ? styles.searchItemSelected : ""
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleUserSelection(item);
                  }}
                >
                  <FriendSearchItem friend={item} userId={userId || ""} isFriend={false} hasSentRequest={false} hasReceivedRequest={false} />
                  {selectedUsers.find((u: any) => u._id === item._id) && (
                    <div className={styles.selectedBadge}>
                      <span className={styles.selectedBadgeText}>✓</span>
                    </div>
                  )}
                </li>
              ))}
              {searchResults.length === 0 && (
                <p className={styles.noDataText}>No users found.</p>
              )}
            </ul>
          </div>
        )}
        <input
          className={styles.input}
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <textarea
          className={`${styles.input} ${styles.textArea}`}
          placeholder="Message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          rows={4}
        />
        {newImage === "" && (
          <button className={styles.uploadButton} onClick={pickImage}>
            Upload Image
          </button>
        )}
        {newImage !== "" && (
          <button onClick={pickImage} className={styles.imagePreviewContainer}>
            <img src={newImage} alt="Preview" className={styles.previewImage} />
          </button>
        )}
        <div className={styles.buttonContainerOverlay}>
          <button className={styles.modalButton} onClick={handleSendCreateNotification}>
            Send Notification
          </button>
          <button className={`${styles.modalButton} ${styles.modalCancelButton}`} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNotificationModal;
