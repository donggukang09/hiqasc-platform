// ============================================
// HIQASC 통합 업무 시스템 설정 파일
// ============================================
// 이 파일에서 모든 Google Sheets ID를 관리합니다.
// 계정 변경 시 이 파일만 수정하면 모든 시스템이 자동 업데이트됩니다.

const SHEETS_CONFIG = {
    // 수리 데이터 (머신 수량 대시보드, 백로그 대시보드)
    REPAIR_DATA: '111K9l8gt-14roqvynNFEJrT2aLsTYjU8gQBsKNiyFmI',
    
    // 재고 관리 (소모품 신청)
    INVENTORY: '1vfnyawoFJnxFODMpmk_iGGwEOfTo0duc1-8VUyPyjcA',
    
    // 부품 사용 기록
    PARTS: '1RUH7EPhOUEVNWvZbizvuf0u3AnZ8K7mbMF-hAto5kKw',
    
    // 연차 관리
    LEAVE: '1cmMEbIkmEL629RT04hpUUgXddnSVLGo1YwRzBwfyzCY',
    
    // 일일 업무 보고
    DAILY_REPORT: '1eyZOi_yD76jijCV8yE5k-FThswFlNu5OxdMy0IRdlEs',
    
    // 추가근로 관리
    OVERTIME: '12U0BzTsjxPfK3AZqQyY479ozC0g1T3Cxutj6XmN75-k'
};

// Apps Script Web App URL
const APPS_SCRIPT_CONFIG = {
    PARTS_INPUT: 'https://script.google.com/macros/s/AKfycbwOdb6vofmvJKRYGbAUSIMWUQ-cbzJp2u7CWpaEwhqQSptZYP_RRwOdM2TaoK4_juOn/exec',
    SUPPLIES_REQUEST: 'https://script.google.com/macros/s/AKfycbzuZ0u1GJAnWh5LmHJqw43rjb2TrrNIxrnzowaHe1iO0uqctHRFkCEVaZRPYKIMxlZjMQ/exec'
};

// ============================================
// DEVELOPED BY DONGGU KANG
// ============================================
