import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const allergyOptions = [
  "알류", "우유", "메밀", "땅콩", "대두",
  "밀", "잣", "호두", "게", "새우",
  "오징어", "고등어", "조개류", "복숭아", "토마토",
  "닭고기", "돼지고기", "쇠고기", "아황산류"
];

const allergyMap = {
  "알류": 1,
  "우유": 2,
  "메밀": 3,
  "땅콩": 4,
  "대두": 5,
  "밀": 6,
  "잣": 7,
  "호두": 8,
  "게": 9,
  "새우": 10,
  "오징어": 11,
  "고등어": 12,
  "조개류": 13,
  "복숭아": 14,
  "토마토": 15,
  "닭고기": 16,
  "돼지고기": 17,
  "쇠고기": 18,
  "아황산류": 19
};

function Register() {
  const [formData, setFormData] = useState({
    id: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    allergies: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAllergy = (item) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(item)
        ? prev.allergies.filter(i => i !== item)
        : [...prev.allergies, item]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const allergyIds = formData.allergies.map(name => allergyMap[name]);

    const requestData = {
      username: formData.id,
      email: formData.email,
      password: formData.password,
      nickname: formData.nickname,
      allergies: allergyIds
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_AUTH_URL}/auth/user/signup`, requestData);

      console.log("회원가입 성공:", res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("회원가입 실패:", err.response?.data || err.message);
      alert("회원가입에 실패했습니다.");
    }
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
      <div className="bg-white p-10 rounded-xl shadow-md w-full max-w-md">
        <div className="text-2xl font-bold text-center mb-8">회원가입</div>
        <form onSubmit={handleSubmit}>
          {/* ID */}
          <div className="mb-5">
            <label htmlFor="id" className="block text-sm text-gray-700 mb-2">아이디</label>
            <input
              type="text"
              id="id"
              name="id"
              placeholder="아이디 입력"
              required
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 닉네임 */}
          <div className="mb-5">
            <label htmlFor="nickname" className="block text-sm text-gray-700 mb-2">닉네임</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              placeholder="닉네임 입력"
              required
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 이메일 */}
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm text-gray-700 mb-2">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="이메일 입력"
              required
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 비밀번호 */}
          <div className="mb-5">
            <label htmlFor="password" className="block text-sm text-gray-700 mb-2">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="비밀번호"
              required
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="mb-5">
            <label htmlFor="confirmPassword" className="block text-sm text-gray-700 mb-2">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="비밀번호 확인"
              required
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 알레르기 선택 */}
          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-2">알레르기 정보</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {allergyOptions.map((item, index) => {
                const selected = formData.allergies.includes(item);
                return (
                  <button
                    type="button"
                    key={index}
                    onClick={() => toggleAllergy(item)}
                    className={`px-3 py-1 rounded-full text-sm border transition
                      ${selected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <div className="text-sm text-gray-600">
              선택된 항목: {formData.allergies.length > 0 ? formData.allergies.join(', ') : '없음'}
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
          >
            회원가입
          </button>
        </form>
      </div>

            {/* 모달 */}
            {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold mb-4">회원가입이 성공적으로 완료되었습니다!</h2>
            <button
              onClick={handleGoToLogin}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
            >
              로그인 페이지로
            </button>
          </div>
        </div>
      )}
    </div>
  );

}

export default Register;
