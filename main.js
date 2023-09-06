function getUsableText() {
    var rawText = document.querySelector('#lessons').innerText;
    rawText = rawText.slice(rawText.indexOf('选课备注') + 5);
    rawText = rawText.replaceAll('\t', '$');
    if (rawText.length <= 0 || rawText[0] != '1') {
        return null;
    }
    var result = [];
    var last_ptr = 0;
    for (var i = 0; i < rawText.length; i += 1) {
        //console.log(rawText[i]);
        // if (rawText[i] == '\n') {
        //     console.log("换行");
        // }
        // else {
        //     console.log(rawText[i]);
        // }
        if (rawText[i] == '\n' && (rawText[i + 2] == '$' || rawText[i + 3] == '$')) {
            result.push(rawText.slice(last_ptr, i));
            last_ptr = i + 1;
        }
    }
    result.push(rawText.slice(last_ptr));
    return result;
}

function getClassStartTime(n) {
    switch (n) {
        case 1:
            return "075000";
        case 2:
            return "084000";
        case 3:
            return "094500";
        case 4:
            return "103500";
        case 5:
            return "112500";
        case 6:
            return "140000";
        case 7:
            return "145000";
        case 8:
            return "155500";
        case 9:
            return "164500";
        case 10:
            return "173500";
        case 11:
            return "193000";
        case 12:
            return "202000";
        case 13:
            return "211000";
    }
}

function getClassEndTime(n) {
    switch (n) {
        case 1:
            return "083500";
        case 2:
            return "092500";
        case 3:
            return "103000";
        case 4:
            return "112000";
        case 5:
            return "121000";
        case 6:
            return "144500";
        case 7:
            return "153500";
        case 8:
            return "164000";
        case 9:
            return "173000";
        case 10:
            return "182000";
        case 11:
            return "201500";
        case 12:
            return "210500";
        case 13:
            return "215500";
    }
}

function getBDAY(n) {
    switch (n) {
        case 1:
            return 'MO';
        case 2:
            return 'TU';
        case 3:
            return 'WE';
        case 4:
            return 'TH';
        case 5:
            return 'FR';
        case 6:
            return 'SA';
        case 7:
            return 'SU';
    }
}

function genICS(result) {
    var start_date = document.querySelector("#startDate").innerText;
    //var start_date = "2022-08-28";
    var ics_s = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SproutAtUSTC\nCALSCALE:GREGORIAN\nBEGIN:VTIMEZONE\nTZID:Asia/Shanghai\nLAST-MODIFIED:20201011T015911Z\nTZURL:http://tzurl.org/zoneinfo-outlook/Asia/Shanghai\nX-LIC-LOCATION:Asia/Shanghai\nBEGIN:STANDARD\nTZNAME:CST\nTZOFFSETFROM:+0800\nTZOFFSETTO:+0800\nDTSTART:19700101T000000\nEND:STANDARD\nEND:VTIMEZONE\n';
    for (var lesson of result) {//一堂课
        var arr = lesson.split("$");
        if (arr[8].length <= 0) {
            continue;
        }
        var lessonName = arr[2];
        var teacher = arr[7];
        var map = new Map;
        for (var g of arr[8].split('\n')) {
            var info = getInfo(g);
            if (info == null) {
                continue;
            }
            if (map.has(info[5])) {
                continue;
            }
            map.set(info[5], 1);//标记
            ics_s += 'BEGIN:VEVENT\n';
            ics_s += 'DTSTAMP:20220913T152100Z\n';
            ics_s += `UID:${info[5]}-${Math.random()*(99999-10000)+10000}\n`;
            ics_s += `DTSTART;TZID=Asia/Shanghai:${getDay(start_date,(parseInt(info[0])-1)*7+parseInt(info[3]))}T${getClassStartTime(parseInt(info[4][0]))}\n`;
            ics_s += `RRULE:FREQ=WEEKLY;BYDAY=${getBDAY(parseInt(info[3]))};COUNT=${parseInt(info[1])-parseInt(info[0])+1}\n`;
            ics_s += `DTEND;TZID=Asia/Shanghai:${getDay(start_date,(parseInt(info[0])-1)*7+parseInt(info[3]))}T${getClassEndTime(parseInt(info[4][info[4].length-1]))}\n`;
            ics_s += `SUMMARY:${lessonName}\n`;
            ics_s += `DESCRIPTION:${teacher}\n`;
            ics_s += `LOCATION:${info[2]}\nEND:VEVENT\n`;
        }   
    }
    ics_s += "END:VCALENDAR";
    return ics_s;
}

function getDay(start, day) {
    //Date()返回当日的日期和时间。
    var days = new Date(start);
    //getTime()返回 1970 年 1 月 1 日至今的毫秒数。
    var gettimes = days.getTime() + 1000 * 60 * 60 * 24 * day;
    //setTime()以毫秒设置 Date 对象。
    days.setTime(gettimes);
    var year = days.getFullYear();
    var month = days.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    var today = days.getDate();
    if (today < 10) {
        today = "0" + today;
    }
    //return year + "-" + month + "-" + today;
    return year + month + today;
}

function getInfo(item) {
    if (item.indexOf('~') == -1 || item.indexOf('周') == -1 || item.indexOf(':') == -1 || item.indexOf('(') == -1 || item.indexOf(')') == -1) {
        return null;
    }
    var start = item.slice(0, item.indexOf('~'));
    var end = item.slice(item.indexOf('~') + 1, item.indexOf('周'));
    var location = item.slice(item.indexOf('周') + 2, item.indexOf(':') - 1);
    var day = item[item.indexOf(':') + 1];
    var class_jieshu = item.slice(item.indexOf('(') + 1, item.indexOf(')')).split(',');
    var ident = start + end + location + day + class_jieshu.join('');
    var result = [];
    result.push(start);
    result.push(end);
    result.push(location);
    result.push(day);
    result.push(class_jieshu);
    result.push(ident);
    return result;
}


var use = getUsableText();
var ics = genICS(use);

// 调用Completion以完成
completion("data:text/calendar,"+ics);