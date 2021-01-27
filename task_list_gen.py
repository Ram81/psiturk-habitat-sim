mpp = {}

for i in range(1, 6):
	for j in range(400, 450):
	    if i not in mpp.keys():
	        mpp[i] = []
	    mpp[i].append(j)
	break

for key, val in mpp.items():
	print(key, val)