'use strict';

var searchFunc = function (path, search_id, content_id) {
    $.ajax({
        url: path,
        dataType: "xml",
        success: function (xmlResponse) {
            // get the contents from search data
            var datas = $("entry", xmlResponse).map(function () {
                return {
                    title: $("title", this).text(),
                    content: $("content", this).text(),
                    url: $("link", this).attr("href"),
                    published: $("published", this).text()
                };
            }).get();
            var $input = document.getElementById(search_id);
            if (!$input) return;
            var $resultContent = document.getElementById(content_id);
            $input.addEventListener('input', function () {
                var str = '<div>';
                var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
                $resultContent.innerHTML = "";
                if (this.value.trim().length <= 0) {
                    return;
                }
                // perform local searching
                var numOfPostFound = 0; // keeping track of # of result
                datas.forEach(function (data) {
                    var isMatch = true;
                    var content_index = [];
                    var data_title = data.title.trim().toLowerCase();
                    var data_content = data.content.trim().replace(/<[^>]+>/g, "").toLowerCase();
                    var data_url = data.url;
                    var data_published = data.published.substring(0, 10)
                    var index_title = -1;
                    var index_content = -1;
                    var first_occur = -1;
                    // only match artiles with not empty titles and contents
                    if (data_title != '' && data_content != '') {
                        keywords.forEach(function (keyword, i) {
                            index_title = data_title.indexOf(keyword);
                            index_content = data_content.indexOf(keyword);
                            if (index_title < 0 && index_content < 0) {
                                isMatch = false;
                            } else {
                                if (index_content < 0) {
                                    index_content = 0;
                                }
                                if (i == 0) {
                                    first_occur = index_content;
                                }
                            }
                        });
                    }
                    if (index_title < 0 && index_content < 0) {
                        isMatch = false
                    }
                    // show search results
                    if (isMatch) {
                        numOfPostFound += 1; // keeping track of # of results
                        str += "<div class='timeline-item'><time>" + data_published + "</time><a target='self' href='" + data_url + "'>" + data_title + "</a></div>";
                        var content = data.content.trim().replace(/<[^>]+>/g, "");
                        if (first_occur >= 0) {
                            // cut out 100 characters
                            var start = first_occur - 20;
                            var end = first_occur + 80;
                            if (start < 0) {
                                start = 0;
                            }
                            if (start == 0) {
                                end = 100;
                            }
                            if (end > content.length) {
                                end = content.length;
                            }
                            var match_content = content.substr(start, end);
                            // highlight all keywords
                            keywords.forEach(function (keyword) {
                                var regS = new RegExp(keyword, "gi");
                                match_content = match_content.replace(regS, "<em class=\"search-keyword\">" + keyword + "</em>");
                            });
                            str += "<p>" + match_content.substr(0, 160) + "...</p>"
                        }
                    }
                });
                str += "</div>";
                // attaching a summary of searching result
                if (numOfPostFound > 0) {
                    summary = numOfPostFound + " Found.";
                } else {
                    summary = "Not Found.";
                }
                var summary = "<h3 class=\"timeline-subtitle\">" + summary + "</h3>";
                $resultContent.innerHTML = summary + str;
            });
        }
    });

}