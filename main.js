document.getElementById('promo-code-toggle').addEventListener('change', function () {
    const promoCodeField = document.querySelector('.promo-code');
    if (this.checked) {
        promoCodeField.classList.add('active');
    } else {
        promoCodeField.classList.remove('active');
    }
});

const switchInput = document.querySelector('.switch-box input[type="checkbox"]');
const returnLocationWrapper = document.getElementById('returnLocationWrapper');
const removeIcon2 = document.querySelector('.remove-icon2');

switchInput.addEventListener('change', function() {
    if (this.checked) {
        returnLocationWrapper.classList.remove('hidden');
        removeIcon2.style.display = 'none';
    } else {
        returnLocationWrapper.classList.add('hidden');
    }
});



document.querySelectorAll('.input-wrapper').forEach(function (element) {
    element.addEventListener('focusin', function () {
        this.classList.add('focused');
    });
    element.addEventListener('focusout', function () {
        this.classList.remove('focused');
    });
});


document.querySelectorAll('.input-wrapper input').forEach(input => {
    input.addEventListener('input', function () {
        // Додаємо або видаляємо клас 'filled' в залежності від значення інпуту
        if (this.value.trim() !== '') {
            this.classList.add('filled');
        } else {
            this.classList.remove('filled');
        }
    });
});



// Додаємо подію кліку на всі іконки очищення тексту
document.querySelectorAll('.clear-icon').forEach(icon => {
    icon.addEventListener('click', function () {
        // Очищаємо значення відповідного інпуту
        const input = this.previousElementSibling;
        input.value = '';
        input.classList.remove('filled');
    });
});












// list location and autocomplit
document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById('myForm');
    const locationInput = document.getElementById('location');
    const returnLocationInput = document.getElementById('returnLocation');
    const selectElement = document.getElementById('dynamic-width-select');


    // Завантаження JSON-файлу
    let locations = [];
    try {
        const response = await fetch('./locations.json');
        const data = await response.json();
        locations = extractLocations(data);
    } catch (error) {
        console.error('Error loading locations:', error);
    }

    function extractLocations(data) {
        let locationsArray = [];
        data.Locations.Country.forEach(country => {
            if (Array.isArray(country.Location)) {
                country.Location.forEach(location => {
                    const locationName = location.$.Name;
                    const cityName = location.$.CityName;
                    const countryName = country.$.name;
                    const lat = parseFloat(location.$.Lat);
                    const lng = parseFloat(location.$.Lng);
                    locationsArray.push({
                        name: locationName,
                        display: `${locationName}, ${cityName}, ${countryName}`,
                        isAirport: locationName.toLowerCase().includes('airport'),
                        lat: lat,
                        lng: lng
                    });
                });
            } else if (country.Location) {
                const location = country.Location.$;
                const locationName = location.Name;
                const cityName = location.CityName;
                const countryName = country.$.name;
                const lat = parseFloat(location.Lat);
                const lng = parseFloat(location.Lng);
                locationsArray.push({
                    name: locationName,
                    display: `${locationName}, ${cityName}, ${countryName}`,
                    isAirport: locationName.toLowerCase().includes('airport'),
                    lat: lat,
                    lng: lng
                });
            }
        });
        return locationsArray;
    }

    function createCustomButton(label, iconPosition, iconType) {
        const buttonDiv = document.createElement('div');
        let svgIcon;

        if (iconType === 'rent') {
            svgIcon = `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#000000" fill-rule="evenodd" d="M8 1a.75.75 0 01.691.46l5.25 12.5a.75.75 0 01-1.027.96L8 12.457 3.086 14.92a.75.75 0 01-1.027-.96l5.25-12.5A.75.75 0 018 1zM4.227 12.67l3.437-1.722a.75.75 0 01.672 0l3.437 1.723L8 3.687 4.227 12.67z" clip-rule="evenodd"></path></g></svg>`;
        } else {
            svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14.1 4C15.7167 4 17.1042 4.525 18.2625 5.575C19.4208 6.625 20 7.93333 20 9.5C20 11.0667 19.4208 12.375 18.2625 13.425C17.1042 14.475 15.7167 15 14.1 15H7.8L10.4 17.6L9 19L4 14L9 9L10.4 10.4L7.8 13H14.1C15.15 13 16.0625 12.6667 16.8375 12C17.6125 11.3333 18 10.5 18 9.5C18 8.5 17.6125 7.66667 16.8375 7C16.0625 6.33333 15.15 6 14.1 6H7V4H14.1Z" fill="black"/></svg>`;
        }

        buttonDiv.innerHTML = iconPosition === 'left' ? `${svgIcon}   ${label}` : `${label} ${svgIcon}`;
        buttonDiv.querySelector('svg').style.margin = iconPosition === 'left' ? '0 10px 0 0' : '0 0 0 10px';
        buttonDiv.style.display = 'flex';
        buttonDiv.style.alignItems = 'center';
        return buttonDiv;
    }

    function autocomplete(inp, arr, isPickup) {
        let currentFocus;
        inp.addEventListener('input', function (e) {
            let a, b, i, val = this.value;
            closeAllLists();
            if (!val) {
                return false;
            }
            currentFocus = -1;
            a = document.createElement('DIV');
            a.setAttribute('id', this.id + '-autocomplete-list');
            a.setAttribute('class', 'autocomplete-items');
            this.parentNode.appendChild(a);

            if (isPickup) {
                const rentNearMeDiv = createCustomButton('Rent car near me', 'left', 'rent');
                rentNearMeDiv.addEventListener('click', function (e) {
                    findNearestLocation(locations, inp);
                    closeAllLists();
                });
                a.appendChild(rentNearMeDiv);
            } else {
                const returnAtPickupDiv = createCustomButton('Return at Pick-up', 'left', 'return');
                returnAtPickupDiv.addEventListener('click', function (e) {
                    inp.value = locationInput.value;
                    closeAllLists();
                });
                a.appendChild(returnAtPickupDiv);
            }for (i = 0; i < arr.length; i++) {
                if (arr[i].display.substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                    b = document.createElement('DIV');
                    const svgIcon = arr[i].isAirport ?
                        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 19 20" fill="none">
<path d="M11 6.947L19 12V14L11 11.474V16.834L14 18.5V20L9.5 19L5 20V18.5L8 16.833V11.473L0 14V12L8 6.947V1.5C8 1.10218 8.15804 0.720644 8.43934 0.43934C8.72064 0.158035 9.10218 0 9.5 0C9.89782 0 10.2794 0.158035 10.5607 0.43934C10.842 0.720644 11 1.10218 11 1.5V6.947Z" fill="black"/>
</svg>` :
                        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 14 20" fill="none">
<path d="M7 9.5C6.33696 9.5 5.70107 9.23661 5.23223 8.76777C4.76339 8.29893 4.5 7.66304 4.5 7C4.5 6.33696 4.76339 5.70107 5.23223 5.23223C5.70107 4.76339 6.33696 4.5 7 4.5C7.66304 4.5 8.29893 4.76339 8.76777 5.23223C9.23661 5.70107 9.5 6.33696 9.5 7C9.5 7.3283 9.43534 7.65339 9.3097 7.95671C9.18406 8.26002 8.99991 8.53562 8.76777 8.76777C8.53562 8.99991 8.26002 9.18406 7.95671 9.3097C7.65339 9.43534 7.3283 9.5 7 9.5ZM7 0C5.14348 0 3.36301 0.737498 2.05025 2.05025C0.737498 3.36301 0 5.14348 0 7C0 12.25 7 20 7 20C7 20 14 12.25 14 7C14 5.14348 13.2625 3.36301 11.9497 2.05025C10.637 0.737498 8.85652 0 7 0Z" fill="black"/>
</svg>`;
                    b.innerHTML = `<div class="autocomplete-svg">${svgIcon}</div><div class="autocomplete-next" ">${arr[i].display}</div>`;
                    b.innerHTML += `<input type="hidden" value="${arr[i].display}">`;
                    b.addEventListener('click', function (e) {
                        inp.value = this.getElementsByTagName('input')[0].value;
                        closeAllLists();
                    });
                    a.appendChild(b);
                }
            }
        });

        inp.addEventListener('keydown', function (e) {
            let x = document.getElementById(this.id + '-autocomplete-list');
            if (x) x = x.getElementsByTagName('div');
            if (e.keyCode === 40) {
                currentFocus++;
                addActive(x);
            } else if (e.keyCode === 38) {
                currentFocus--;
                addActive(x);
            } else if (e.keyCode === 13) {
                e.preventDefault();
                if (currentFocus > -1) {
                    if (x) x[currentFocus].click();
                }
            }
        });

        function addActive(x) {
            if (!x) return false;
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            x[currentFocus].classList.add('autocomplete-active');
        }

        function removeActive(x) {
            for (let i = 0; i < x.length; i++) {
                x[i].classList.remove('autocomplete-active');
            }
        }

        function closeAllLists(elmnt) {
            const x = document.getElementsByClassName('autocomplete-items');
            for (let i = 0; i < x.length; i++) {
                if (elmnt !== x[i] && elmnt !== inp) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }

        document.addEventListener('click', function (e) {
            closeAllLists(e.target);
        });
    }

    try {
        const response = await fetch('./locations.json');
        const data = await response.json();
        locations = extractLocations(data);
        const countries = extractCountries(data);
        populateSelect(countries);
        const userCoords = await detectUserLocation(); // Використання await
        if (userCoords) {
            const nearestLocation = findNearestLocationCoords(locations, userCoords);
            if (nearestLocation) {
                selectCountry(nearestLocation.display.split(', ').pop());
            } else {
                console.log('No nearby locations found.');
            }
        } else {
            selectCountry('Ukraine'); // Set default to Aruba if geolocation is not available
        }
    } catch (error) {
        console.error('Error loading locations:', error);
        selectCountry('Ukraine'); // Set default to Aruba if there is an error loading locations
    }

    function extractCountries(data) {
        let countriesArray = [];
        data.Locations.Country.forEach(country => {
            const countryName = country.$.name;
            countriesArray.push(countryName);
        });
        return countriesArray;
    }

    function populateSelect(countries) {
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            selectElement.appendChild(option);
        });
    }

    async function detectUserLocation() {
        if (navigator.geolocation) {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    console.log('User coordinates:', lat, lon);
                    resolve({ lat, lon });
                }, (error) => {
                    console.error('Geolocation error:', error);
                    resolve(null); // У разі помилки повертаємо null
                });
            });
        } else {
            console.error('Geolocation is not supported by this browser.');
            return null; // У разі відсутності підтримки геолокації повертаємо null
        }
    }

    function findNearestLocationCoords (locations, userCoords) {
        const userLat = userCoords.lat;
        const userLng = userCoords.lon;
        let nearestLocation = null;
        let minDistance = Infinity;

        locations.forEach(location => {
            const distance = calculateDistance(userLat, userLng, location.lat, location.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearestLocation = location;
            }
        });

        return nearestLocation;
    }





    function selectCountry(country) {
        if (country) {
            console.log('Detected country:', country);
            const options = selectElement.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].value === country) {
                    selectElement.selectedIndex = i;
                    adjustSelectWidth(selectElement);
                    break;
                }
            }
        } else {
            console.log('Country not detected.');
        }
    }

    function findNearestLocation(locations, input) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                let nearestLocation = null;
                let minDistance = Infinity;

                locations.forEach(location => {
                    const distance = calculateDistance(userLat, userLng, location.lat, location.lng);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestLocation = location;
                    }
                });

                if (nearestLocation) {
                    input.value = nearestLocation.display;
                } else {
                    alert('No nearby locations found.');
                }
            }, function (error) {
                console.error('Geolocation error:', error);
                alert('Could not retrieve your location.');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    function adjustSelectWidth(selectElement) {
        const optionText = selectElement.options[selectElement.selectedIndex].text;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = window.getComputedStyle(selectElement).fontSize;
        const fontFamily = window.getComputedStyle(selectElement).fontFamily;
        context.font = `${fontSize} ${fontFamily}`;
        const width = context.measureText(optionText).width;
        selectElement.style.width = `${width +10}px`;
    }


    selectElement.addEventListener('change', function() {
        adjustSelectWidth(this);
    });


    autocomplete(locationInput, locations, true);
    autocomplete(returnLocationInput, locations, false);


    // Submit
    form.onsubmit = function (event) {
        event.preventDefault();

        document.getElementById('hidden-country').value = document.getElementById('dynamic-width-select').value;
        document.getElementById('hidden-age').value = document.getElementById('age-select').value;
        document.getElementById('pickup-date-input').value = document.getElementById('pickup-date-display').innerText;
        document.getElementById('dropoff-date-input').value = document.getElementById('dropoff-date-display').innerText;
        document.getElementById('pickup-time-input').value = document.getElementById('pickup-hour-display').innerText;
        document.getElementById('dropoff-time-input').value = document.getElementById('dropoff-hour-display').innerText;

        const inputs = form.querySelectorAll("input[type='text'], input[type='hidden']");
        let formIsValid = true;
        let formData = {};


        inputs.forEach(input => {
            const inputWrapper = input.closest('.input-wrapper');
            if (inputWrapper) {
                const errorIcon = inputWrapper.querySelector('.error-icon');


                // при фокусі, видаляє іконку error
                input.addEventListener('focus', () => {
                    if (errorIcon) {
                        errorIcon.style.display = 'none';
                    }
                });

                //добавляє класс error і припиняє submit при певних умовах
                if (input.name === 'location' && !locations.some(location => location.display === input.value)) {
                    inputWrapper.classList.add('error');
                    input.classList.add('error');
                    input.classList.remove('filled');
                    if (errorIcon) {
                        errorIcon.style.display = 'inline';
                    }
                    formIsValid = false;

                } else if (input.name === 'returnLocation' && !locations.some(location => location.display === input.value) && !returnLocationWrapper.classList.contains('hidden')) {
                    inputWrapper.classList.add('error');
                    input.classList.add('error');
                    input.classList.remove('filled');
                    const locationInput = form.querySelector("input[name='location']");
                    if (errorIcon) {
                        errorIcon.style.display = 'inline';
                    }
                    formIsValid = false;
                } else if (input.name === 'returnLocation' && returnLocationWrapper.classList.contains('hidden')) {
                    const locationInput = form.querySelector("input[name='location']");
                    if (locationInput && locations.includes(locationInput.value.trim())) {
                        input.value = locationInput.value.trim();
                        formData[input.name] = input.value;
                        inputWrapper.classList.remove('error');
                        input.classList.remove('error');
                        if (errorIcon) {
                            errorIcon.style.display = 'none';
                        }
                    }
                } else {
                    if (input.name !== 'search-country') {
                        formData[input.name] = input.value;
                    }
                    inputWrapper.classList.remove('error');
                    input.classList.remove('filled')
                    input.classList.remove('error');
                    if (errorIcon) {
                        errorIcon.style.display = 'none';
                    }
                }
            } else {
                if (input.name !== 'search-country') {
                    formData[input.name] = input.value;
                }
            }
        });

        if (formIsValid) {
            fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    form.reset();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

            form.reset();
        }
    };


    // Hidden/find dropoff location
    const returnLocationButton = document.querySelector('.return-location');
    const returnLocationWrapper = document.getElementById('returnLocationWrapper');
    const closeDropoffLocation = document.getElementById('expanded-icon2');

    returnLocationButton.addEventListener('click', () => {
        returnLocationButton.classList.add('hidden');
        returnLocationWrapper.classList.remove('hidden');
    });

    closeDropoffLocation.addEventListener('click', () => {
        returnLocationButton.classList.remove('hidden');
        returnLocationWrapper.classList.add('hidden');
    })

})


// calendar and modalWindow
document.addEventListener('DOMContentLoaded', function () {
    const calendarBody1 = document.getElementById('calendar-body-1');
    const calendarBody2 = document.getElementById('calendar-body-2');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const monthYear1 = document.getElementById('month-year-1');
    const monthYear2 = document.getElementById('month-year-2');
    const pickupPicker = document.getElementById('pickup-picker');
    const dropoffPicker = document.getElementById('dropoff-picker');
    const pickupPickerModal = document.getElementById('pickup-picker-model');
    const dropoffPickerModal = document.getElementById('dropoff-picker-model');
    const calendarContainer = document.querySelector('.calendar-container');
    const headerData = document.getElementById('headerData');
    const pickupHourContainer = document.getElementById('pickup-hour-container');
    const dropoffHourContainer = document.getElementById('dropoff-hour-container');
    const pickupHourContainerModal = document.getElementById('pickup-hour-container-modal');
    const dropoffHourContainerModal = document.getElementById('dropoff-hour-container-modal');
    const dropoffHourDisplayModal = document.getElementById('dropoff-hour-display-modal');
    const pickupHourDisplayModal = document.getElementById('pickup-hour-display-modal');
    const pickupHourDisplay = document.getElementById('pickup-hour-display');
    const dropoffHourDisplay = document.getElementById('dropoff-hour-display');
    const weekBody = document.querySelector('.weekBody');
    const continueButton = document.getElementById('continue-btn');


    let currentPickerTime = '';




    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    let selectedPickupDate = new Date(today);
    let selectedDropoffDate = new Date(today);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    let currentPicker = 'pickup';

    function updateCalendar() {
        calendarBody1.innerHTML = '';
        calendarBody2.innerHTML = '';

        const firstMonthYear = getAdjustedMonthYear(currentMonth, currentYear);
        const secondMonthYear = getAdjustedMonthYear(currentMonth + 1, currentYear);

        const firstMonthDays = getDaysInMonth(firstMonthYear.year, firstMonthYear.month);
        const secondMonthDays = getDaysInMonth(secondMonthYear.year, secondMonthYear.month);

        monthYear1.textContent = `${months[firstMonthYear.month]} ${firstMonthYear.year}`;
        monthYear2.textContent = `${months[secondMonthYear.month]} ${secondMonthYear.year}`;

        appendWeekDays(calendarBody1);
        appendDays(calendarBody1, firstMonthDays, firstMonthYear.month, firstMonthYear.year);

        appendWeekDays(calendarBody2);
        appendDays(calendarBody2, secondMonthDays, secondMonthYear.month, secondMonthYear.year);

        updateDateDisplays();
        updateContinueButton()

    }

    function appendWeekDays(container) {
        weekDays.forEach(day => {
            const cell = document.createElement('div');
            cell.className = 'day-cell weekday-header';
            cell.textContent = day;
            container.appendChild(cell);
        });
    }

    function appendDays(container, days, month, year) {
        const firstDay = new Date(year, month, 1).getDay();
        const emptyCells = (firstDay + 6) % 7;

        for (let i = 0; i < emptyCells; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell';
            container.appendChild(emptyCell);
        }

        days.forEach((day) => {
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            cell.textContent = day;
            const date = new Date(year, month, day);
            cell.dataset.date = date.toISOString(); // Зберігаємо дату у форматі ISO

            if (date < today && date.toDateString() !== today.toDateString()) {
                cell.classList.add('past-date');
            } else {
                if (date.getDay() === 0 || date.getDay() === 6) {
                    cell.classList.add('weekend');
                } else {
                    cell.classList.add('weekday');
                }

                if (currentPicker === 'dropoff' && selectedPickupDate && date < selectedPickupDate) {
                    cell.classList.add('disabled');
                } else {
                    cell.addEventListener('click', () => selectDate(date));
                }

                if (window.innerWidth > 768) {
                    cell.addEventListener('mouseover', () => {
                        if (currentPicker === 'dropoff' && selectedPickupDate && date > selectedPickupDate) {
                            addInRangeClasses(date);
                            cell.classList.add('hover-highlight');
                        }
                    });

                    cell.addEventListener('mouseout', () => {
                        clearInRangeClasses();
                        cell.classList.remove('hover-highlight');
                    });
                }


            }

            if (date.toDateString() === today.toDateString()) {
                cell.classList.add('today');
            }

            if (selectedPickupDate && date.toDateString() === selectedPickupDate.toDateString()) {
                cell.classList.add('selected-pickup');
            }

            if (selectedDropoffDate && date.toDateString() === selectedDropoffDate.toDateString()) {
                cell.classList.add('selected-dropoff');
            }

            if (selectedPickupDate && selectedDropoffDate && date > selectedPickupDate && date < selectedDropoffDate) {
                cell.classList.add('in-range');
            }

            container.appendChild(cell);
        });

        const totalCells = emptyCells + days.length;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 0; i < remainingCells; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell';
            container.appendChild(emptyCell);
        }
    }

    function getDaysInMonth(year, month) {
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
            days.push(date.getDate());
            date.setDate(date.getDate() + 1);
        }
        return days;
    }

    function getAdjustedMonthYear(month, year) {
        if (month < 0) {
            return {month: 11, year: year - 1};
        } else if (month > 11) {
            return {month: 0, year: year + 1};
        } else {
            return {month: month, year: year};
        }
    }

    function selectDate(date) {
        if (currentPicker === 'pickup') {
            selectedPickupDate = date;
            if (selectedDropoffDate && selectedDropoffDate < selectedPickupDate) {
                selectedDropoffDate = null;
            }
            currentPicker = 'dropoff';
            if (window.innerWidth > 768) {
                pickupPicker.classList.remove('focused-clas');
                dropoffPicker.classList.add('focused-clas');
            } else {
                pickupPickerModal.classList.remove('focused-clas');
                dropoffPickerModal.classList.add('focused-clas');
            }
        } else if (currentPicker === 'dropoff') {
            selectedDropoffDate = date;
            currentPicker = 'pickup';
            calendarContainer.style.display = 'none';
            if (window.innerWidth > 768) {
                dropoffPicker.classList.remove('focused-clas');
            }else {
                dropoffPickerModal.classList.remove('focused-clas');
                pickupPickerModal.classList.add('focused-clas');
            }

        }
        updateCalendar();
        updateDateDisplays();
        updateModalCalendar();
        updateContinueButton();
    }

    function updateDateDisplays() {
        const pickupDateDisplay = document.getElementById('pickup-date-display');
        const dropoffDateDisplay = document.getElementById('dropoff-date-display');
        const pickupDateDisplayModal = document.getElementById('pickup-date-display-modal');
        const dropoffDateDisplayModal = document.getElementById('dropoff-date-display-modal');

        pickupDateDisplay.textContent = formatDate(selectedPickupDate);
        dropoffDateDisplay.textContent = formatDate(selectedDropoffDate);

        pickupDateDisplayModal.textContent = formatDate(selectedPickupDate);
        dropoffDateDisplayModal.textContent = formatDate(selectedDropoffDate);
    }

    function formatDate(date) {
        if (!date) return 'N/A';
        const options = {month: 'short', day: 'numeric'};
        return date.toLocaleDateString('en-US', options);
    }

    function showCalendar(event) {
        // event.stopPropagation();
        if (window.innerWidth <= 768) {
            showModal();
            return;
        }

        calendarContainer.style.display = 'block';

        const rect = document.getElementById('original-picker-section').getBoundingClientRect();

        calendarContainer.style.position = 'absolute';
        calendarContainer.style.top = `${rect.bottom + window.scrollY}px`;

        updateCalendar();
    }

    function hideCalendar(event) {
        const calendar = document.querySelector('.calendar-container');
        if (calendar.style.display === 'block' && !calendar.contains(event.target) &&
            !event.target.closest('#pickup-picker') &&
            !event.target.closest('#dropoff-picker') &&
            !event.target.closest('#prev-button') &&
            !event.target.closest('#next-button') &&
            currentPicker === 'pickup') {
            calendar.style.display = 'none';
        }
    }

    function showPreviousMonth() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendar();
    }

    function showNextMonth() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar();
    }

    function addInRangeClasses(hoverDate) {
        document.querySelectorAll('.day-cell').forEach(dayCell => {
            const dayDate = new Date(dayCell.dataset.date);
            if (dayDate > selectedPickupDate && dayDate < hoverDate) {
                dayCell.classList.add('in-range');
            }
        });
    }

    function clearInRangeClasses() {
        document.querySelectorAll('.day-cell').forEach(dayCell => {
            dayCell.classList.remove('in-range');
        });
    }

    //Функції для модального вікна
    function showModal() {
        if (window.innerWidth > 768) return; // Відкриваємо модальне вікно лише на мобільних пристроях

        const modal = document.getElementById('date-modal');
        modal.style.display = 'block';

        if (currentPicker === 'dropoff') {
            dropoffPickerModal.classList.add('focused-clas');
            pickupPickerModal.classList.remove('focused-clas');
        } else if (currentPicker === 'pickup'){
            pickupPickerModal.classList.add('focused-clas');
            dropoffPickerModal.classList.remove('focused-clas');
        }


        document.getElementById('calendar-container-modal').classList.remove('hidden');
        document.getElementById('time-modal-pickup').classList.add('hidden');
        document.getElementById('time-modal-dropoff').classList.add('hidden');
        document.querySelector('.background-btn').classList.remove('hidden');
        document.querySelector('.modal-header').classList.remove('hidden');
        weekBody.style.display = 'grid';


        document.getElementById('add').classList.add('data-picker')
        document.querySelectorAll('.remove').forEach(clases => {
            clases.classList.add('date-model-data')
        })
        document.querySelectorAll('.add-rem').forEach(clases => {
            clases.classList.remove('time-date')
        })


        dropoffHourContainerModal.style.display = 'none';
        pickupHourContainerModal.style.display = 'none';
        headerData.querySelector('h3').textContent = 'Trip dates';



        updateModalCalendar(); // Виклик функції оновлення календаря
    }

    // Функція для показу модального вікна з вибором часу для pickup
    function showTimeModalPickup() {
        if (window.innerWidth > 768) return; // Відкриваємо модальне вікно лише на мобільних пристроях

        const modal = document.getElementById('date-modal');
        modal.style.display = 'block';
        pickupPickerModal.classList.remove('focused-clas');
        dropoffPickerModal.classList.remove('focused-clas');
        document.getElementById('time-modal-pickup').classList.remove('hidden');
        document.getElementById('time-modal-dropoff').classList.add('hidden');
        document.getElementById('calendar-container-modal').classList.add('hidden');
        weekBody.style.display = 'none';
        dropoffHourContainerModal.style.display = 'flex';
        pickupHourContainerModal.style.display = 'flex';
        pickupHourContainerModal.classList.add('focused-clas')
        dropoffHourContainerModal.classList.remove('focused-clas')
        headerData.querySelector('h3').textContent = 'Select pick-up time';
        currentPickerTime = 'pickupTime';

        modal.scrollTop = 0;


        document.getElementById('add').classList.remove('data-picker')
        document.querySelectorAll('.remove').forEach(clases => {
            clases.classList.remove('date-model-data')
        })
        document.querySelectorAll('.add-rem').forEach(clases => {
            clases.classList.add('time-date')
        })
        document.querySelectorAll('#time-select-container-pickup .time-option').forEach(button => {
            if (button.textContent === pickupHourDisplay.textContent) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Функція для показу модального вікна з вибором часу для dropoff
    function showTimeModalDropoff() {
        if (window.innerWidth > 768) return; // Відкриваємо модальне вікно лише на мобільних пристроях

        const modal = document.getElementById('date-modal');
        modal.style.display = 'block';
        pickupPickerModal.classList.remove('focused-clas');
        document.getElementById('time-modal-dropoff').classList.remove('hidden');
        document.getElementById('time-modal-pickup').classList.add('hidden');
        document.getElementById('calendar-container-modal').classList.add('hidden');
        weekBody.style.display = 'none';

        dropoffHourContainerModal.style.display = 'flex';
        pickupHourContainerModal.style.display = 'flex';
        dropoffHourContainerModal.classList.add('focused-clas');
        pickupHourContainerModal.classList.remove('focused-clas')
        headerData.querySelector('h3').textContent = 'Select drop-off time';
        currentPickerTime = 'dropoffTime';

        modal.scrollTop = 0;

        document.getElementById('add').classList.remove('data-picker')
        document.querySelectorAll('.remove').forEach(clases => {
            clases.classList.remove('date-model-data')
        })
        document.querySelectorAll('.add-rem').forEach(clases => {
            clases.classList.add('time-date')
        })

        document.querySelectorAll('#time-select-container-dropoff .time-option').forEach(button => {
            if (button.textContent === dropoffHourDisplay.textContent) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    function updateModalCalendar() {
        const modalCalendarContainer = document.getElementById('calendar-container-modal');
        modalCalendarContainer.innerHTML = '';

        const calendarContainers = [];

        for (let i = 0; i < 12; i++) {
            const calendarSection = document.createElement('div');
            calendarSection.classList.add('calendar-section');

            const newContainer = document.createElement('div');
            newContainer.classList.add('calendar-body');

            const monthYearElement = document.createElement('div');
            monthYearElement.classList.add('month-year');
            calendarSection.appendChild(monthYearElement);

            calendarSection.appendChild(newContainer);
            calendarContainers.push(newContainer);
            modalCalendarContainer.appendChild(calendarSection);
        }

        // Заповнення календарів даними для кожного місяця
        let tempMonth = currentMonth;
        let tempYear = currentYear;

        for (let i = 0; i < 12; i++) {
            const monthYear = getAdjustedMonthYear(tempMonth, tempYear);
            const monthDays = getDaysInMonth(monthYear.year, monthYear.month);

            const monthYearElement = calendarContainers[i].previousElementSibling;
            monthYearElement.textContent = `${months[monthYear.month]} ${monthYear.year}`;

            appendDays(calendarContainers[i], monthDays, monthYear.month, monthYear.year);

            tempMonth++;
            if (tempMonth > 11) {
                tempMonth = 0;
                tempYear++;
            }
        }

        updateDateDisplays();
    }

    function hideModal() {
        const modal = document.getElementById('date-modal');
        modal.style.display = 'none'

    }

    // Обробка вибору часу
    document.querySelectorAll('.time-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.time-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            if (currentPickerTime === 'pickupTime') {
                pickupHourDisplayModal.textContent = option.textContent;
                pickupHourDisplay.textContent = option.textContent;
            } else if (currentPickerTime === 'dropoffTime') {
                dropoffHourDisplayModal.textContent = option.textContent;
                dropoffHourDisplay.textContent = option.textContent;
            }
        });
    });

    function updateContinueButton() {
        if (selectedDropoffDate) {
            continueButton.disabled = false;
            continueButton.style.opacity = 1;
        } else {
            continueButton.disabled = true;
            continueButton.style.opacity = 0.5;
        }
    }


    function handleContinue() {
        if (continueButton.disabled) {
            return;
        }

        const timeModalPickup = document.getElementById('time-modal-pickup');

        if (!timeModalPickup.classList.contains('hidden')) {
            showTimeModalDropoff();
        } else {
            hideModal();
        }
    }
    // Initial setup
    updateCalendar();



    pickupPicker.addEventListener('click', () => {
        currentPicker = 'pickup';
        if (window.innerWidth <= 768) {
            showModal();
        } else {
            showCalendar();
        }
    });
    dropoffPicker.addEventListener('click', () => {
        currentPicker = 'dropoff';
        if (window.innerWidth <= 768) {
            showModal();
        } else {
            showCalendar();
        }
    });

    document.getElementById('close-modal-btn').addEventListener('click', hideModal);
    continueButton.addEventListener('click', handleContinue);
    document.addEventListener('click', hideCalendar);
    prevButton.addEventListener('click', showPreviousMonth);
    nextButton.addEventListener('click', showNextMonth);
    pickupPickerModal.addEventListener('click', () => {currentPicker = 'pickup';showModal();});
    dropoffPickerModal.addEventListener('click', () => {currentPicker = 'dropoff';showModal();});
    pickupHourContainer.addEventListener('click', showTimeModalPickup);
    dropoffHourContainer.addEventListener('click', showTimeModalDropoff);
    pickupHourContainerModal.addEventListener('click', showTimeModalPickup);
    dropoffHourContainerModal.addEventListener('click', showTimeModalDropoff);





    function toggleSelectVisibility(containerId, selectId) {
        if (window.innerWidth <= 768) return; // Відключаємо для мобільної версії
        hideCalendar();
        const container = document.getElementById(containerId);
        const select = document.getElementById(selectId);

        container.addEventListener('click', function (event) {
            // event.stopPropagation();
            select.classList.toggle('hidden');

            select.style.position = 'absolute';
            select.style.top = container.offsetHeight + 'px';
            select.style.left = '0';
            select.style.width = container.offsetWidth + 'px';
            select.focus();
        });

        select.addEventListener('change', function () {
            document.getElementById(containerId).querySelector('span').innerText = this.options[this.selectedIndex].text;

            setTimeout(() => {
                select.classList.add('hidden');
            }, 100);
        });
    }

// Initialize pick-up time
    toggleSelectVisibility('pickup-hour-container', 'pickup-time-select');

// Initialize drop-off time
    toggleSelectVisibility('dropoff-hour-container', 'dropoff-time-select');

// Hide select when clicking outside

    document.querySelectorAll('.data-picker-day, .data-picker-hour').forEach(function (element) {
        element.addEventListener('click', function (event) {
            // event.stopPropagation();
            document.querySelectorAll('.data-picker-day, .data-picker-hour').forEach(function (el) {
                el.classList.remove('focused-clas');
            });
            this.classList.add('focused-clas');
            document.addEventListener('click', hidePicker, true);
        });
    });

    function hidePicker(event) {
        document.querySelectorAll('.data-picker-day, .data-picker-hour').forEach(function (element) {
            if (!element.contains(event.target)) {
                element.classList.remove('focused-clas');
                const select = element.querySelector('select');
                if (select) {
                    select.classList.add('hidden');
                }
            }
        });
        document.removeEventListener('click', hidePicker, true);
    }

    document.querySelectorAll('.data-picker-hour select').forEach(function (select) {
        if (window.innerWidth > 768) {
            select.addEventListener('click', function (event) {
                // event.stopPropagation();
            });
            select.addEventListener('blur', function () {
                this.classList.add('hidden');
                this.parentElement.classList.remove('focused-clas');
            });
        }
    });

});


// Mobile form
document.addEventListener('DOMContentLoaded', function () {
    if (window.innerWidth <= 768) {
        const formContainer = document.querySelector('.search-container');
        const removeIcon = document.getElementById('remove-expanded-icon');
        const returnLocationWrapper = document.getElementById('returnLocationWrapper');
        const returnLocationButton = document.querySelector('.return-location');
        const promoCodeField = document.querySelector('.promo-code');
        const promoCodeToggle = document.getElementById('promo-code-toggle');
        const locationInput = document.getElementById('location');
        const submitBtn = document.querySelector('.submit-btn');
        const residenceAndAge = document.querySelector('.residence-and-age');
        const dataPickerContainer = document.querySelector('.data-picker-container');
        const horizonBlock = document.querySelector('.horizonBlock');

// Функція для розширення форми

        const moveResidenceAndAge = () => {
            if (horizonBlock && dataPickerContainer && residenceAndAge) {
                horizonBlock.insertBefore(residenceAndAge, dataPickerContainer.nextSibling);
            }
        };
        const expandForm = () => {
            document.querySelectorAll('.return-location, .data-picker-container, .residence-and-age, .check-box, .input-wrapper, .submit-btn, .promo-code, #returnLocationWrapper')
                .forEach(el => el.classList.add('expanded'));
            locationInput.blur();
            returnLocationButton.classList.remove('mobi-hidden');
            formContainer.classList.remove('fixed-on-focus');
            submitBtn.style.display = 'block';
            moveResidenceAndAge();
        };

        locationInput.addEventListener('focus', () => {
            formContainer.classList.add('expanded');
            submitBtn.style.display = 'none';
            formContainer.classList.add('fixed-on-focus');
            removeIcon.style.display = 'inline';
        });

        document.addEventListener('click', function (e) {
            if (e.target.closest('.autocomplete-items div')) {
                expandForm();
            }
        });

        locationInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                expandForm();
            }
        });

        removeIcon.addEventListener('click', function () {
            formContainer.classList.remove('expanded');
            document.querySelectorAll('.return-location, .data-picker-container, .residence-and-age, .check-box, .input-wrapper, .submit-btn, .promo-code, #returnLocationWrapper')
                .forEach(el => el.classList.remove('expanded'));
            removeIcon.style.display = 'none';
            returnLocationButton.classList.remove('hidden');
            returnLocationWrapper.classList.add('hidden');
            locationInput.blur();
            formContainer.classList.remove('fixed-on-focus');
            submitBtn.style.display = 'block';
            if (promoCodeField.classList.contains('active')) {
                promoCodeField.classList.remove('active');
                promoCodeToggle.checked = false;
            }
        });
    }
});