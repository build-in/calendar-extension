document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let events = {};
    
    // 从存储加载事件
    chrome.storage.local.get('calendarEvents', function(data) {
      if (data.calendarEvents) {
        events = data.calendarEvents;
      }
      renderCalendar(currentDate);
    });
    
    // 渲染日历
    function renderCalendar(date) {
      const daysContainer = document.getElementById('days-container');
      daysContainer.innerHTML = '';
      
      const year = date.getFullYear();
      const month = date.getMonth();
      
      document.getElementById('current-month').textContent = 
        `${year}年${month + 1}月`;
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const prevLastDay = new Date(year, month, 0).getDate();
      const firstDayIndex = firstDay.getDay();
      const lastDayIndex = lastDay.getDay();
      const nextDays = 7 - lastDayIndex - 1;
      
      const today = new Date();
      const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
      
      // 上个月的最后几天
      for (let i = firstDayIndex; i > 0; i--) {
        const day = prevLastDay - i + 1;
        const dayElement = createDayElement(day, 'other-month');
        daysContainer.appendChild(dayElement);
      }
      
      // 当前月的所有天
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayDate = new Date(year, month, i);
        const dayKey = formatDateKey(dayDate);
        
        const dayElement = createDayElement(i, 'current-month');
        
        if (events[dayKey]) {
          dayElement.classList.add('has-event');
        }
        
        if (isCurrentMonth && i === today.getDate()) {
          dayElement.classList.add('today');
        }
        
        daysContainer.appendChild(dayElement);
      }
      
      // 下个月的前几天
      for (let i = 1; i <= nextDays; i++) {
        const dayElement = createDayElement(i, 'other-month');
        daysContainer.appendChild(dayElement);
      }
    }
    
    function createDayElement(day, className) {
      const dayElement = document.createElement('div');
      dayElement.classList.add('day', className);
      dayElement.textContent = day;
      
      dayElement.addEventListener('click', function() {
        const currentDate = new Date(
          document.getElementById('current-month').textContent.replace('年', '-').replace('月', '-') + day
        );
        openEventModal(currentDate);
      });
      
      return dayElement;
    }
    
    function openEventModal(date) {
      const modal = document.getElementById('event-modal');
      const modalDate = document.getElementById('modal-date');
      const eventText = document.getElementById('event-text');
      const saveBtn = document.getElementById('save-event');
      const deleteBtn = document.getElementById('delete-event');
      
      const dayKey = formatDateKey(date);
      modalDate.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
      
      if (events[dayKey]) {
        eventText.value = events[dayKey];
        deleteBtn.style.display = 'inline-block';
      } else {
        eventText.value = '';
        deleteBtn.style.display = 'none';
      }
      
      modal.style.display = 'block';
      
      saveBtn.onclick = function() {
        events[dayKey] = eventText.value;
        chrome.storage.local.set({ calendarEvents: events }, function() {
          renderCalendar(currentDate);
          modal.style.display = 'none';
        });
      };
      
      deleteBtn.onclick = function() {
        delete events[dayKey];
        chrome.storage.local.set({ calendarEvents: events }, function() {
          renderCalendar(currentDate);
          modal.style.display = 'none';
        });
      };
    }
    
    function formatDateKey(date) {
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }
    
    // 关闭模态框
    document.querySelector('.close').addEventListener('click', function() {
      document.getElementById('event-modal').style.display = 'none';
    });
    
    // 上个月/下个月
    document.getElementById('prev-month').addEventListener('click', function() {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar(currentDate);
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar(currentDate);
    });
  });