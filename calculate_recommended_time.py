# Jai shree ram
def calculateRecommendedTime(userRating, questionRating):
  """Calculates the recommended time it should take a user with a given rating to solve a problem with a given rating.

  Args:
    userRating: The user's rating.
    questionRating: The problem's rating.

  Returns:
    The recommended time it should take the user to solve the problem.
  """

  # Load the Codeforces User Practice and Rating History dataset
  df = pd.read_csv('cf-userdata.csv')

  # Filter the dataset to only include accepted submissions
  df = df[df['Verdict'] == 'AC']

  # Calculate the average time it took users to solve problems at each rating level
  rating_groups = df.groupby('Rating')
  average_solve_times = rating_groups['Time'].mean()

  # Fit a linear regression model to the average solve times at different rating levels
  X = np.array(average_solve_times.index)
  y = np.array(average_solve_times)
  model = LinearRegression()
  model.fit(X, y)

  # Predict the recommended time using the regression model
  recommended_time = model.predict([[userRating]])

  # Return the recommended time
  return recommended_time[0]
