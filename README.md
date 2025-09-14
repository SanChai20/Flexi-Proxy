# 多语言文档

<select id="languageSelector">
    <option value="en">English</option>
    <option value="zh">简体中文</option>
</select>

<div id="documentation-content">
    <!-- 内容将通过JavaScript动态加载 -->
</div>

<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script>
document.getElementById('languageSelector').addEventListener('change', function() {
    loadDocumentation(this.value);
});

// 默认加载英文文档
loadDocumentation('en');

function loadDocumentation(lang) {
    fetch(`https://flexiproxy.com/docs/DOCUMENTATION.md`)
        .then(response => response.text())
        .then(text => {
            document.getElementById('documentation-content').innerHTML = marked.parse(text);
        })
        .catch(error => {
            console.error('Error loading documentation:', error);
        });
}
</script>