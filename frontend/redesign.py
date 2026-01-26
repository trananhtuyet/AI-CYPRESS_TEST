#!/usr/bin/env python3
# -*- coding: utf-8 -*-

new_html = '''<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Analyzer</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #10b981;
            --primary-light: #6ee7b7;
            --primary-dark: #059669;
            --secondary: #3b82f6;
            --danger: #ef4444;
            --success: #22c55e;
            --bg-light: #f8fafc;
            --bg-white: #ffffff;
            --text-dark: #1f2937;
            --text-gray: #6b7280;
            --border: #e5e7eb;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Plus Jakarta Sans', sans-serif;
        }

        body {
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            min-height: 100vh;
            display: flex;
        }

        .sidebar {
            width: 240px;
            height: 100vh;
            background: var(--bg-white);
            border-right: 1px solid var(--border);
            position: fixed;
            display: flex;
            flex-direction: column;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            z-index: 1000;
            overflow-y: auto;
        }

        .sidebar-brand {
            padding: 1.25rem;
            font-size: 1.1rem;
            font-weight: 800;
            color: var(--primary-dark);
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid var(--border);
        }

        .sidebar-brand i { color: var(--primary); }

        .sidebar-menu {
            flex: 1;
            padding: 1rem 0.5rem;
        }

        .menu-item {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            color: var(--text-gray);
            text-decoration: none;
            border-radius: 8px;
            margin-bottom: 0.3rem;
            transition: all 0.25s;
            font-weight: 500;
            font-size: 0.9rem;
        }

        .menu-item i { margin-right: 10px; width: 20px; }

        .menu-item:hover,
        .menu-item.active {
            background: rgba(16, 185, 129, 0.1);
            color: var(--primary);
        }

        .main-content {
            margin-left: 240px;
            flex: 1;
            padding: 2rem;
            overflow-x: hidden;
            max-width: calc(100vw - 240px);
        }

        .header h1 {
            font-size: 2rem;
            font-weight: 900;
            color: var(--primary-dark);
            margin-bottom: 0.3rem;
        }

        .header p {
            color: var(--text-gray);
            font-size: 0.95rem;
            margin-bottom: 2rem;
        }

        .search-container {
            background: var(--bg-white);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            margin-bottom: 2rem;
            display: flex;
            gap: 1rem;
        }

        .search-input {
            flex: 1;
            padding: 0.75rem 1rem;
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 0.95rem;
            transition: all 0.25s;
        }

        .search-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .search-btn {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.25s;
            white-space: nowrap;
        }

        .search-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .loading-container {
            text-align: center;
            padding: 3rem;
            background: var(--bg-white);
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(16, 185, 129, 0.2);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 1rem;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-container p {
            color: var(--text-gray);
            font-weight: 500;
        }

        .hidden { display: none !important; }

        .info-card {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: 0 8px 16px rgba(16, 185, 129, 0.25);
        }

        .info-title {
            font-size: 1.8rem;
            font-weight: 900;
            margin-bottom: 0.3rem;
        }

        .info-url {
            font-size: 0.9rem;
            opacity: 0.9;
            word-break: break-all;
        }

        .info-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-box { text-align: center; }

        .stat-number {
            font-size: 2rem;
            font-weight: 900;
        }

        .stat-label {
            font-size: 0.85rem;
            opacity: 0.9;
            margin-top: 0.3rem;
        }

        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .section {
            background: var(--bg-white);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--border);
            font-size: 1.1rem;
            font-weight: 800;
            color: var(--text-dark);
        }

        .section-title i { color: var(--primary); font-size: 1.2rem; }

        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 1rem;
        }

        .feature-item {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.03));
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 10px;
            text-align: center;
            transition: all 0.25s;
        }

        .feature-item:hover {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08));
            border-color: var(--primary);
            transform: translateY(-3px);
        }

        .feature-icon {
            width: 35px;
            height: 35px;
            margin: 0 auto 0.5rem;
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
        }

        .feature-name {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text-dark);
        }

        .test-grid {
            display: grid;
            gap: 0.75rem;
        }

        .test-item {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.02));
            border: 1px solid rgba(59, 130, 246, 0.15);
            border-radius: 10px;
            transition: all 0.25s;
        }

        .test-item:hover {
            border-color: var(--secondary);
            transform: translateX(3px);
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
        }

        .test-item-title {
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 0.3rem;
            font-size: 0.9rem;
        }

        .test-item-desc {
            font-size: 0.85rem;
            color: var(--text-gray);
            margin-bottom: 0.5rem;
        }

        .test-code {
            background: #1f2937;
            color: #e5e7eb;
            padding: 0.75rem;
            border-radius: 6px;
            font-family: monospace;
            font-size: 0.75rem;
            overflow-x: auto;
            max-height: 150px;
            overflow-y: auto;
            line-height: 1.3;
        }

        .button-group {
            display: grid;
            gap: 0.5rem;
        }

        .btn {
            padding: 0.75rem;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.25s;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-secondary {
            background: linear-gradient(135deg, var(--secondary), #1e40af);
            color: white;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid var(--border);
        }

        .tab-btn {
            padding: 0.5rem 1rem;
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            color: var(--text-gray);
            font-weight: 700;
            cursor: pointer;
            transition: all 0.25s;
            font-size: 0.85rem;
        }

        .tab-btn.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
        }

        .tab-content { display: none; }
        .tab-content.active { display: block; }

        .form-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
        }

        .form-label {
            font-weight: 700;
            color: var(--text-dark);
            font-size: 0.85rem;
        }

        .form-input,
        .form-select,
        .form-textarea {
            padding: 0.6rem;
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 0.85rem;
            font-family: inherit;
            transition: all 0.25s;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .form-textarea {
            resize: vertical;
            min-height: 80px;
            grid-column: 1 / -1;
        }

        .form-submit {
            width: 100%;
            padding: 0.75rem;
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.25s;
            font-size: 0.9rem;
        }

        .form-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .results-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .result-box {
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
        }

        .result-box.success {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
            border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .result-box.danger {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
            border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .result-number { font-size: 1.8rem; font-weight: 900; }
        .result-box.success .result-number { color: var(--success); }
        .result-box.danger .result-number { color: var(--danger); }

        .result-label {
            color: var(--text-gray);
            font-size: 0.8rem;
            font-weight: 600;
            margin-top: 0.25rem;
        }

        @media (max-width: 1024px) {
            .content-grid { grid-template-columns: 1fr; }
            .form-row { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
            .sidebar { width: 60px; }
            .main-content { margin-left: 60px; padding: 1rem; max-width: calc(100vw - 60px); }
            .search-container { flex-direction: column; }
            .sidebar-brand span, .menu-item span { display: none; }
            .info-stats { grid-template-columns: 1fr 1fr; }
            .results-grid { grid-template-columns: 1fr; }
            .feature-grid { grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); }
        }

        @media (max-width: 480px) {
            .sidebar { width: 50px; }
            .main-content { margin-left: 50px; padding: 0.75rem; max-width: calc(100vw - 50px); }
            .header h1 { font-size: 1.5rem; }
            .search-container { gap: 0.5rem; }
            .section { padding: 1rem; }
            .info-stats { grid-template-columns: 1fr; }
            .feature-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <!-- SIDEBAR -->
    <aside class="sidebar">
        <div class="sidebar-brand">
            <i class="fas fa-sparkles"></i>
            <span>Analyzer</span>
        </div>
        <nav class="sidebar-menu">
            <a href="dashboard.html" class="menu-item">
                <i class="fas fa-home"></i> <span>Dashboard</span>
            </a>
            <a href="website-analyzer.html" class="menu-item active">
                <i class="fas fa-globe"></i> <span>Website Analyzer</span>
            </a>
            <a href="analytics.html" class="menu-item">
                <i class="fas fa-chart-bar"></i> <span>Analytics</span>
            </a>
            <a href="script-review.html" class="menu-item">
                <i class="fas fa-code"></i> <span>Script Review</span>
            </a>
            <a href="auth.html" class="menu-item" onclick="logout(); return false;">
                <i class="fas fa-sign-out-alt"></i> <span>Logout</span>
            </a>
        </nav>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
        <div class="header">
            <h1>Website Analyzer</h1>
            <p>Phân tích website & sinh test case tự động</p>
        </div>

        <div class="search-container">
            <input type="url" id="websiteUrl" class="search-input" placeholder="Nhập URL website (vd: https://example.com)" />
            <button onclick="analyzeWebsite()" class="search-btn">
                <i class="fas fa-search"></i> Phân tích
            </button>
        </div>

        <div id="loadingState" class="loading-container hidden">
            <div class="spinner"></div>
            <p>Đang phân tích website...</p>
        </div>

        <div id="analysisContent" class="hidden">
            <div class="info-card">
                <div class="info-title" id="analyzedTitle">Website Title</div>
                <div class="info-url" id="analyzedUrl">https://example.com</div>
                <div class="info-stats">
                    <div class="stat-box">
                        <div class="stat-number" id="featuresCount">0</div>
                        <div class="stat-label">Chức Năng</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number" id="testCasesCount">0</div>
                        <div class="stat-label">AI Tests</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number" id="customTestCount">0</div>
                        <div class="stat-label">Custom</div>
                    </div>
                </div>
            </div>

            <div class="content-grid">
                <div>
                    <div class="section">
                        <div class="section-title">
                            <i class="fas fa-cube"></i>
                            <span>Chức Năng Phát Hiện</span>
                        </div>
                        <div id="featuresContainer" class="feature-grid"></div>
                    </div>
                </div>

                <div>
                    <div class="section">
                        <div class="section-title">
                            <i class="fas fa-play-circle"></i>
                            <span>Chạy Tests</span>
                        </div>
                        <div class="button-group">
                            <button onclick="runAllTests()" class="btn btn-primary">
                                <i class="fas fa-play"></i> Chạy Tất Cả
                            </button>
                            <button onclick="runAITests()" class="btn btn-secondary">
                                <i class="fas fa-robot"></i> Chạy AI
                            </button>
                            <button onclick="runCustomTests()" class="btn btn-secondary">
                                <i class="fas fa-check"></i> Chạy Custom
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">
                    <i class="fas fa-robot"></i>
                    <span>AI Generated Tests</span>
                </div>
                <div id="testCasesContainer" class="test-grid"></div>
            </div>

            <div id="resultsSection" class="section hidden">
                <div class="section-title">
                    <i class="fas fa-chart-bar"></i>
                    <span>Kết Quả Tests</span>
                </div>
                <div class="results-grid">
                    <div class="result-box success">
                        <div class="result-number" id="passedTests">0</div>
                        <div class="result-label">Passed</div>
                    </div>
                    <div class="result-box danger">
                        <div class="result-number" id="failedTests">0</div>
                        <div class="result-label">Failed</div>
                    </div>
                </div>
                <div id="testResultsList" class="test-grid"></div>
            </div>

            <div class="section">
                <div class="section-title">
                    <i class="fas fa-plus-circle"></i>
                    <span>Test Cases Tùy Chỉnh</span>
                </div>

                <div class="tabs">
                    <button class="tab-btn active" onclick="switchTab(event, 'add-test')">
                        <i class="fas fa-file-plus"></i> Thêm Mới
                    </button>
                    <button class="tab-btn" onclick="switchTab(event, 'list-test')">
                        <i class="fas fa-list"></i> Danh Sách
                    </button>
                </div>

                <div id="add-test" class="tab-content active">
                    <form onsubmit="addCustomTest(event)" class="form-row" style="display: block;">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Tên Test</label>
                                <input type="text" id="testName" class="form-input" placeholder="Tên test case" required />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Loại</label>
                                <select id="testType" class="form-select" required>
                                    <option>Functional</option>
                                    <option>Security</option>
                                    <option>Performance</option>
                                    <option>UI/UX</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Ưu Tiên</label>
                                <select id="testPriority" class="form-select" required>
                                    <option>Critical</option>
                                    <option>High</option>
                                    <option>Medium</option>
                                    <option>Low</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Mô Tả Các Bước</label>
                            <textarea id="testSteps" class="form-textarea" placeholder="1. Mở trang...&#10;2. Nhập dữ liệu..." required></textarea>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Cypress Code</label>
                            <textarea id="testCode" class="form-textarea" placeholder="cy.visit('/')&#10;cy.get('input').type('test')" required></textarea>
                        </div>

                        <button type="submit" class="form-submit">
                            <i class="fas fa-save"></i> Lưu Test Case
                        </button>
                    </form>
                </div>

                <div id="list-test" class="tab-content">
                    <div id="customTestsList" class="test-grid"></div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">
                    <i class="fas fa-download"></i>
                    <span>Xuất Kết Quả</span>
                </div>
                <div class="button-group">
                    <button onclick="exportCypressTests()" class="btn btn-primary">
                        <i class="fas fa-file-code"></i> Cypress (.js)
                    </button>
                    <button onclick="exportJSON()" class="btn btn-secondary">
                        <i class="fas fa-file-code"></i> JSON (.json)
                    </button>
                    <button onclick="exportCSV()" class="btn btn-secondary">
                        <i class="fas fa-table"></i> CSV (.csv)
                    </button>
                </div>
            </div>
        </div>
    </main>

    <script>
        let analyzedData = null;
        let customTests = [];

        function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'auth.html';
        }

        function switchTab(e, tabId) {
            e.preventDefault();
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            e.target.closest('.tab-btn').classList.add('active');
        }

        async function analyzeWebsite() {
            const url = document.getElementById('websiteUrl').value.trim();
            if (!url) {
                alert('❌ Vui lòng nhập URL');
                return;
            }

            try {
                new URL(url);
            } catch {
                alert('❌ URL không hợp lệ');
                return;
            }

            showLoading(true);

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = 'auth.html';
                    return;
                }

                const response = await fetch('http://localhost:3000/api/website-analyzer', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url })
                });

                if (!response.ok) throw new Error('Phân tích thất bại');

                const data = await response.json();
                analyzedData = data;
                displayAnalysis(data);
                setTimeout(() => document.querySelector('.info-card')?.scrollIntoView({ behavior: 'smooth' }), 300);
            } catch (error) {
                alert('❌ ' + error.message);
            } finally {
                showLoading(false);
            }
        }

        function showLoading(show) {
            document.getElementById('loadingState').classList.toggle('hidden', !show);
            document.getElementById('analysisContent').classList.toggle('hidden', show);
        }

        function displayAnalysis(data) {
            document.getElementById('analyzedTitle').textContent = data.title || 'Website';
            document.getElementById('analyzedUrl').textContent = data.url || '';
            document.getElementById('featuresCount').textContent = (data.features || []).length;
            document.getElementById('testCasesCount').textContent = (data.testCases || []).length;
            document.getElementById('customTestCount').textContent = customTests.length;

            const featuresContainer = document.getElementById('featuresContainer');
            if (data.features?.length) {
                featuresContainer.innerHTML = data.features.map(f => `
                    <div class="feature-item">
                        <div class="feature-icon"><i class="fas ${getFeatureIcon(f.type)}"></i></div>
                        <div class="feature-name">${f.name}</div>
                    </div>
                `).join('');
            } else {
                featuresContainer.innerHTML = '<p style="color: var(--text-gray); text-align: center; padding: 2rem;">Không phát hiện chức năng nào</p>';
            }

            const testCasesContainer = document.getElementById('testCasesContainer');
            if (data.testCases?.length) {
                testCasesContainer.innerHTML = data.testCases.map(t => `
                    <div class="test-item">
                        <div class="test-item-title">${t.title}</div>
                        <div class="test-item-desc">${t.description}</div>
                        <div class="test-code">${escapeHtml(t.code)}</div>
                    </div>
                `).join('');
            } else {
                testCasesContainer.innerHTML = '<p style="color: var(--text-gray); text-align: center; padding: 2rem;">Không tạo được test case nào</p>';
            }

            updateCustomList();
        }

        function getFeatureIcon(type) {
            const icons = {
                'form': 'fa-clipboard',
                'navigation': 'fa-compass',
                'authentication': 'fa-lock',
                'search': 'fa-search',
                'modal': 'fa-window-maximize',
                'table': 'fa-table',
                'api': 'fa-plug',
                'payment': 'fa-credit-card'
            };
            return icons[type] || 'fa-cube';
        }

        function addCustomTest(e) {
            e.preventDefault();
            customTests.push({
                id: Date.now(),
                name: document.getElementById('testName').value,
                type: document.getElementById('testType').value,
                priority: document.getElementById('testPriority').value,
                steps: document.getElementById('testSteps').value,
                code: document.getElementById('testCode').value
            });
            e.target.reset();
            updateCustomList();
            document.getElementById('customTestCount').textContent = customTests.length;
            alert('✅ Test case đã được lưu!');
        }

        function updateCustomList() {
            const list = document.getElementById('customTestsList');
            if (!customTests.length) {
                list.innerHTML = '<p style="color: var(--text-gray); text-align: center; padding: 2rem;">Chưa có test case tùy chỉnh</p>';
                return;
            }
            list.innerHTML = customTests.map(t => `
                <div class="test-item" style="border-left: 4px solid #f59e0b;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <div class="test-item-title">${t.name}</div>
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.3rem;">
                                <span style="font-size: 0.75rem; padding: 0.2rem 0.6rem; background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-radius: 4px;">${t.type}</span>
                                <span style="font-size: 0.75rem; padding: 0.2rem 0.6rem; background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-radius: 4px;">${t.priority}</span>
                            </div>
                        </div>
                        <button onclick="deleteCustomTest(${t.id})" style="background: rgba(239, 68, 68, 0.1); color: var(--danger); border: none; padding: 0.4rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="test-item-desc" style="margin-top: 0.5rem; white-space: pre-wrap;">${escapeHtml(t.steps)}</div>
                    <div class="test-code">${escapeHtml(t.code)}</div>
                </div>
            `).join('');
        }

        function deleteCustomTest(id) {
            customTests = customTests.filter(t => t.id !== id);
            updateCustomList();
            document.getElementById('customTestCount').textContent = customTests.length;
        }

        async function runAllTests() {
            const codes = [...(analyzedData?.testCases || []).map(t => t.code), ...customTests.map(t => t.code)];
            await executeTests(codes);
        }

        async function runAITests() {
            const codes = (analyzedData?.testCases || []).map(t => t.code);
            await executeTests(codes);
        }

        async function runCustomTests() {
            if (!customTests.length) {
                alert('⚠️ Không có custom test');
                return;
            }
            const codes = customTests.map(t => t.code);
            await executeTests(codes);
        }

        async function executeTests(codes) {
            if (!codes.length) {
                alert('⚠️ Không có test để chạy');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = 'auth.html';
                    return;
                }

                document.getElementById('resultsSection').classList.remove('hidden');
                const response = await fetch('http://localhost:3000/api/run-cypress-tests', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ testCodes: codes, url: document.getElementById('websiteUrl').value })
                });

                if (!response.ok) throw new Error('Chạy tests thất bại');
                const results = await response.json();
                displayResults(results);
                setTimeout(() => document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' }), 300);
            } catch (error) {
                alert('❌ ' + error.message);
            }
        }

        function displayResults(results) {
            const total = results.results.length;
            const passed = results.results.filter(r => r.status === 'pass').length;
            const failed = total - passed;

            document.getElementById('passedTests').textContent = passed;
            document.getElementById('failedTests').textContent = failed;

            const list = document.getElementById('testResultsList');
            list.innerHTML = results.results.map((r, i) => {
                const isPass = r.status === 'pass';
                const borderColor = isPass ? 'var(--success)' : 'var(--danger)';
                return `
                    <div class="test-item" style="border-left: 4px solid ${borderColor};">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="test-item-title">Test ${i + 1}</div>
                            <span style="font-size: 0.75rem; padding: 0.2rem 0.6rem; background: ${isPass ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${borderColor}; border-radius: 4px; font-weight: 700;">${r.status.toUpperCase()}</span>
                        </div>
                        ${r.output ? `<div class="test-code">${escapeHtml(r.output)}</div>` : ''}
                    </div>
                `;
            }).join('');

            alert(`✅ Kết quả: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function exportCypressTests() {
            const code = [...(analyzedData?.testCases || []).map(t => t.code), ...customTests.map(t => t.code)].join('\\n\\n');
            downloadFile(code, 'tests.js', 'text/javascript');
        }

        function exportJSON() {
            const data = {
                url: document.getElementById('websiteUrl').value,
                features: analyzedData?.features || [],
                tests: analyzedData?.testCases || [],
                custom: customTests
            };
            downloadFile(JSON.stringify(data, null, 2), 'analysis.json', 'application/json');
        }

        function exportCSV() {
            let csv = 'Name,Type,Priority,Steps,Code\\n';
            customTests.forEach(t => csv += `"${t.name}","${t.type}","${t.priority}","${t.steps.replace(/"/g, '""')}","${t.code.replace(/"/g, '""')}"\\n`);
            downloadFile(csv, 'tests.csv', 'text/csv');
        }

        function downloadFile(content, filename, type) {
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        }
    </script>
</body>
</html>
'''

with open('website-analyzer.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print('✅ Redesign complete! File saved.')
