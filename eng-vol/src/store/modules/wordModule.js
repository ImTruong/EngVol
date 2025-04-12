const state = function () {
    return {
        fakeStaticByTime: [
            {
                date: "2021-06-01",
                numberOfWords: 3,
                wordList: [
                    {
                        word: "word1",
                        meaning: "meaning1",
                        time: "10:00",
                        difficulty: "easy"
                    },
                    {
                        word: "word2",
                        meaning: "meaning2",
                        time: "10:00",
                        difficulty: "hard",
                    },
                    {
                        word: "word3",
                        meaning: "meaning3",
                        time: "10:00",
                        difficulty: "very hard",
                    }
                ]
            },
            {
                date: "2021-06-02",
                numberOfWords: 3,
                wordList: [
                    {
                        word: "word4",
                        meaning: "meaning4",
                        time: "10:00",
                        difficulty: "easy"
                    },
                    {
                        word: "word5",
                        meaning: "meaning5",
                        time: "10:00",
                        difficulty: "hard",
                    },
                    {
                        word: "word6",
                        meaning: "meaning6",
                        time: "10:00",
                        difficulty: "very hard",
                    }
                ]
            },
            {
                date: "2021-06-03",
                numberOfWords: 3,
                wordList: [
                    {
                        word: "word7",
                        meaning: "meaning7",
                        time: "10:00",
                        difficulty: "easy"
                    },
                    {
                        word: "word8",
                        meaning: "meaning8",
                        time: "10:00",
                        difficulty: "hard",
                    },
                    {
                        word: "word9",
                        meaning: "meaning9",
                        time: "10:00",
                        difficulty: "very hard",
                    }
                ]
            }
        ],
        fakeStaticByWord: [
            {
                word: "word1",
                timeStudy: 3,
                dateList: [
                    {
                        date: "2021-06-01",
                        time: "10:00",
                        difficulty: "easy"
                    },
                    {
                        date: "2021-06-02",
                        time: "10:00",
                        difficulty: "hard"
                    },
                    {
                        date: "2021-06-03",
                        time: "10:00",
                        difficulty: "very hard"
                    }
                ]
            },
            {
                word: "word2",
                timeStudy: 3,
                dateList: [
                    {
                        date: "2021-06-01",
                        time: "10:00",
                        difficulty: "easy"
                    },
                    {
                        date: "2021-06-02",
                        time: "10:00",
                        difficulty: "hard"
                    },
                    {
                        date: "2021-06-03",
                        time: "10:00",
                        difficulty: "very hard"
                    }
                ]
            },
            {
                word: "word3",
                timeStudy: 3,
                dateList: [
                    {
                        date: "2021-06-01",
                        time: "10:00",
                        difficulty: "easy"
                    },
                    {
                        date: "2021-06-02",
                        time: "10:00",
                        difficulty: "hard"
                    },
                    {
                        date: "2021-06-03",
                        time: "10:00",
                        difficulty: "very hard"
                    }
                ]
            }
        ]
    }
}

export default {
    namespaced: true,
    state,
}