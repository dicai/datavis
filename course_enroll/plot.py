import pylab

def plot(filename):
    """ filename should be in .csv format with header describing each column """
    pylab.figure(1)
    pylab.clf()

    file = open(filename, 'r')
    header = file.readline()
    names = []
    rowLabels = header.split(',')[1:]

    for line in file:
        entries = line.split(',')
        entries.reverse()
        pylab.plot(entries[:-1], linewidth=3)
        names.append(entries[-1])

    rowLabels.reverse()
    pylab.xticks(range(len(rowLabels)), rowLabels)
    pylab.legend(names, loc='upper left')
    pylab.axvline(x=1, linewidth=4, color='y', linestyle='--')
    pylab.xlabel('Classes')
    pylab.ylabel('Enrollment Size')
    pylab.savefig('all.png')

plot('numbers.csv') 


