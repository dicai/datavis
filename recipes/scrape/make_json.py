import numpy as np
import pylab
import process
import pdb
import numpy as np

def process_ings(ingstring):

    ings = ingstring.strip().split(';')

    units = []
    names = []

    for ing in ings:
        try:
            unit, item = ing.split('|')
            prop = process._convert_unit(unit)
            if prop == None:
                continue
            units.append(prop)
            names.append(item)
        except:
            pass
            print ing

    # normalize units
    units = np.array(units)
    units /= np.sum(units)

    return units, names

def make_strings(units, names):

    prop_string = ''
    name_string = ''

    for i in range(len(units)):
        if i != 0:
            prop_string += ';'
            name_string += ';'
        prop_string += '%.4f' % units[i]
        name_string += '%s' % names[i].strip()

    return prop_string, name_string

def make_json(infile, outfile):

    f = open(infile, 'r')
    out = open(outfile, 'w')

    header = f.readline()
    out.write('[\n')

    for line in f:
        line = line.replace('"', '').replace('&lt;', '').\
                replace('&nbsp;', ' ').replace('&#174;', ''). \
            replace('&#34;', '').replace('&amp;', 'and').replace('&#8482;', '')

        title, rating, kcal, chol, carbs, fat, protein, fiber, \
                sodium, time, ings, full_ings = line.split('\t')

        if rating == "0":
            continue

        nings = len(ings.split(';'))

        units, names = process_ings(full_ings)
        u_str, n_str = make_strings(units, names)

        out.write('\t{\n\t\t"title": "%s",  \
        \n\t\t"rating": %s, \
        \n\t\t"kcal": %s, \
        \n\t\t"chol": %s, \
        \n\t\t"fat": %s,     \
        \n\t\t"protein": %s,  \
        \n\t\t"fiber": %s, \
        \n\t\t"sodium": %s, \
        \n\t\t"time": %s, \
        \n\t\t"ning": %s, \
        \n\t\t"ings": "%s", \
        \n\t\t"full_ings": "%s", \
        \n\t\t"props": "%s", \
        \n\t\t"names": "%s" \
        \n\t}, \n' 
                % (title, rating, kcal, chol, fat, protein, fiber, sodium, 
                    time, nings, ings.strip(), full_ings.strip().replace("| ", "|"),
                    u_str, n_str))

    out.write(']')

    f.close()
    out.close()

def make_plot(infile, outfile=None):

    f = open(infile, 'r')
    if outfile:
        out = open(outfile, 'w')

    header = f.readline()

    total = np.array([])
    for line in f:
        if True:
            # filter out bad characters
            line = line.replace('"', '').replace('&lt;', '').\
                    replace('&nbsp;', ' ').replace('&#174;', ''). \
                replace('&#34;', '').replace('&amp;', 'and').replace('&#8482;', '')
            # split line
            title, rating, kcal, chol, carbs, fat, protein, fiber, \
            sodium, time, ings = line.split('\t')

            ing_list = ings.strip().split(';')
            total = np.concatenate((total, np.array(ing_list)))


    ids = {}
    new = np.zeros(len(total))
    count = 0
    for i in range(len(total)):
        if total[i] not in ids:
            ids[total[i]] = count
            new[i] = count
            count += 1
        else:
            new[i] = ids[total[i]]

    return new
