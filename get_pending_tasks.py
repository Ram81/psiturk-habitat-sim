import csv

exclude_eps = [  1,  1,  7,  7, 15, 18, 22, 25, 31, 32, 35, 36, 39, 40, 43, 44, 47, 47, 48, 51, 52, 56, 57, 60, 61, 63, 64, 66, 67, 70, 73, 76, 79, 82, 85, 88, 91, 94, 97, 99,100,101,102,103,104,105,106,108,109,111,112,114,115,116,116,132,135,139,142,148,149,152,153,156,157,160,161,164,165,168,169,173,174,177,178,180,181,183,184,187,190,193,196,196,196,199,202,205,208,211,214,216,217,218,219,220,221,222,223,225,226,228,229,231,232,242,242,249,252,252,252,256,259,265,266,269,270,273,274,277,278,281,281,282,282,282,285,286,290,291,294,295,297,298,300,301,304,307,310,313,316,319,322,325,328,331,333,334,335,336,337,338,339,340,342,343,345,346,348,349,366,367,367,369,373,376,382,383,386,387,390,391,394,395,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538,539,540,541,542,543,544,545,546,547,548,549,550,551,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567,568,569,570,571,572,572,573,574,575,576,577,578,579,580,581,582,583,584]

def read_csv(path, delimiter=","):
    file = open(path, "r")
    reader = csv.reader(file, delimiter=delimiter)
    return reader


def get_pending_episodes():
    csv_reader = read_csv("data.csv")
    task_map = {}
    next(csv_reader, None)
    for row in csv_reader:
        if len(row) == 0:
            continue
        task_id = int(row[0].strip())
        episode_id = int(row[1].strip())
        
        if task_id not in task_map.keys():
            task_map[task_id] = []
        task_map[task_id].append(episode_id)
    
    for task_id in task_map.keys():
        missing_episodes = []
        for i in range(0, 585):
            if i not in task_map[task_id]:
                missing_episodes.append(i)

        print("Task: {}, Missing episodes: {}".format(task_id, missing_episodes))


def get_exlcuded_episodes():
    csv_reader = read_csv("data_2.csv")
    task_map = {}
    next(csv_reader, None)
    for row in csv_reader:
        if len(row) == 0:
            continue
        task_id = int(row[0].strip())
        episode_id = int(row[1].strip())

        if episode_id not in exclude_eps:
            print("{}, {}, {}".format(task_id, episode_id, 1))


if __name__ == "__main__":
    get_pending_episodes()
    # get_exlcuded_episodes()
