function addPerson(person = null) {
  const container = document.getElementById('peopleContainer');
  const div = document.createElement('div');
  div.className = 'person-entry';
  div.innerHTML = `
    <label>姓名: <input type="text" class="name" value="${person ? person.name : ''}" required></label><br>
    <label>入住日期: <input type="date" class="checkin" value="${person ? person.checkin : ''}" required></label><br>
    <label>退房日期: <input type="date" class="checkout" value="${person ? person.checkout : ''}" required></label><br>
  `;
  container.appendChild(div);
}

function saveToStorage() {
  const names = document.querySelectorAll('.name');
  const checkins = document.querySelectorAll('.checkin');
  const checkouts = document.querySelectorAll('.checkout');
  const people = [];

  for (let i = 0; i < names.length; i++) {
    people.push({
      name: names[i].value,
      checkin: checkins[i].value,
      checkout: checkouts[i].value,
    });
  }

  localStorage.setItem('roommates', JSON.stringify(people));
  localStorage.setItem('rent', document.getElementById('rent').value);
  localStorage.setItem('water', document.getElementById('water').value);
  localStorage.setItem('electric', document.getElementById('electric').value);
}

function loadFromStorage() {
  const data = localStorage.getItem('roommates');
  if (data) {
    const roommates = JSON.parse(data);
    roommates.forEach(p => addPerson(p));
  } else {
    for (let i = 0; i < 5; i++) addPerson();
  }

  document.getElementById('rent').value = localStorage.getItem('rent') || '';
  document.getElementById('water').value = localStorage.getItem('water') || '';
  document.getElementById('electric').value = localStorage.getItem('electric') || '';
}

function clearStorage() {
  localStorage.clear();
  location.reload();
}

document.getElementById('billForm').addEventListener('input', saveToStorage);

document.getElementById('billForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const rent = parseFloat(document.getElementById('rent').value);
  const water = parseFloat(document.getElementById('water').value);
  const electric = parseFloat(document.getElementById('electric').value);
  const utilityCost = water + electric;

  const names = document.querySelectorAll('.name');
  const checkins = document.querySelectorAll('.checkin');
  const checkouts = document.querySelectorAll('.checkout');

  const people = [];
  let totalDays = 0;

  for (let i = 0; i < names.length; i++) {
    const name = names[i].value;
    const inDate = new Date(checkins[i].value);
    const outDate = new Date(checkouts[i].value);
    const days = Math.floor((outDate - inDate) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      alert(name + " 的入住/退房日期无效");
      return;
    }

    people.push({ name, days });
    totalDays += days;
  }

  const fixedRentPerPerson = rent / people.length;
  let resultHTML = `<p>总水电费 RM ${utilityCost.toFixed(2)}，总天数 ${totalDays} 天</p><ul>`;
  for (const person of people) {
    const utilityShare = (person.days / totalDays) * utilityCost;
    const total = fixedRentPerPerson + utilityShare;
    resultHTML += `<li>${person.name}：住了 ${person.days} 天，应付：房租 RM ${fixedRentPerPerson.toFixed(2)} + 水电 RM ${utilityShare.toFixed(2)} = 总计 RM ${total.toFixed(2)}</li>`;
  }
  resultHTML += '</ul>';
  document.getElementById('result').innerHTML = resultHTML;
});

window.onload = loadFromStorage;
